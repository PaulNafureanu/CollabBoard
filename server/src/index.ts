import "dotenv/config";
import cors from "cors";
import express from "express";
import http from "http";
import Redis from "ioredis";
import { Server as IOServer } from "socket.io";

import type { ClientToServerEvents, ServerToClientEvents } from "@collabboard/shared";
import { createAdapter } from "@socket.io/redis-adapter";
import helmet from "helmet";
import { buildContext } from "./context/context";
import { errorHandler, jsonParseGuard } from "./middleware/errors";
import { wireRealtime } from "./realtime";
import type { ServerSideEvents, SocketDataSchema } from "./realtime/types";
import { boards } from "./routes/boards";
import { boardStates } from "./routes/boardStates";
import { health } from "./routes/health";
import { main } from "./routes/main";
import { memberships } from "./routes/memberships";
import { messages } from "./routes/messages";
import { rooms } from "./routes/rooms";
import { users } from "./routes/users";
import { version } from "./routes/version";
import { strToArray } from "./utils/string";

const app = express();

// CORS
const corsOriginEnv = process.env.CORS_ORIGIN ?? "http://localhost:5173";
const corsOrigin = strToArray(corsOriginEnv);

app.use(cors({ origin: corsOrigin, credentials: true }));
app.use(express.json({ limit: "1mb" }));
app.use(jsonParseGuard);
app.use(helmet());

// Routes
app.use(main);
app.use(health);
app.use(version);
app.use("/users", users);
app.use("/rooms", rooms);
app.use("/boards", boards);
app.use("/boardstates", boardStates);
app.use("/memberships", memberships);
app.use("/messages", messages);

// Errors Handler
app.use(errorHandler);

// HTTP server and attach Socket.IO to it
const server = http.createServer(app);

const clientOrigins = strToArray(process.env.CLIENT_ORIGIN ?? "http://localhost:5173");

const io = new IOServer<ClientToServerEvents, ServerToClientEvents, ServerSideEvents, SocketDataSchema>(server, {
  path: "/socket.io",
  cors: {
    origin: clientOrigins,
    credentials: true,
    methods: ["GET", "POST"],
  },
});

const redisURL = process.env.REDIS_URL ?? "redis://localhost:6379";

const redisData = new Redis(redisURL);
const pub = new Redis(redisURL);
const sub = new Redis(redisURL);

pub.on("connect", () => console.log("[redis:pub] connected"));
sub.on("connect", () => console.log("[redis:sub] connected"));
redisData.on("connect", () => console.log("[redis:data] connected"));

pub.on("error", (err) => console.error("[redis:pub] error: ", err.message));
sub.on("error", (err) => console.error("[redis:sub] error: ", err.message));
redisData.on("error", (err) => console.error("[redis:data] error: ", err.message));

io.adapter(createAdapter(pub, sub));
const ctx = buildContext(io, redisData);
app.locals.ctx = ctx;
wireRealtime(ctx);

const PORT = Number(process.env.PORT ?? 3000);
server.listen(PORT, () => {
  console.log(`API Server + Socket.IO listening on http://localhost:${PORT}`);
});

// Shutdown
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
async function shutdown() {
  console.log("Shutting down...");
  io.close(); // stop accepting new sockets, close existing

  await Promise.allSettled([pub.quit(), sub.quit(), redisData.quit()]);
  server.close(() => process.exit(0));

  // safety timer
  setTimeout(() => process.exit(0), 5000).unref();
}
