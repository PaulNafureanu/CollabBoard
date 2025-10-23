import "dotenv/config";
import cors from "cors";
import express from "express";
import http from "http";
import Redis from "ioredis";
import { Server as IOServer } from "socket.io";

import helmet from "helmet";
import { errorHandler, jsonParseGuard } from "./middleware/errors";
import { wireCursor } from "./realtime";
import { boards } from "./routes/boards";
import { boardStates } from "./routes/boardStates";
import { health } from "./routes/health";
import { main } from "./routes/main";
import { memberships } from "./routes/memberships";
import { messages } from "./routes/messages";
import { rooms } from "./routes/rooms";
import { users } from "./routes/users";
import { version } from "./routes/version";
import { strToArray } from "./utils/stringUtils";

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

const clientOrigins = strToArray(
  process.env.CLIENT_ORIGIN ?? "http://localhost:5173",
);

const io = new IOServer(server, {
  path: "/socket.io",
  cors: {
    origin: clientOrigins,
    credentials: true,
    methods: ["GET", "POST"],
  },
});

const redis = new Redis(process.env.REDIS_URL ?? "redis://localhost:6379");

// Basic Redis connection logging
redis.on("connect", () => console.log("[redis] connected"));
redis.on("error", (err) => console.error("[redis] error:", err.message));

wireCursor(io, redis);

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
  await redis.quit().catch(() => redis.disconnect());
  server.close(() => process.exit(0));
  // safety timer
  setTimeout(() => process.exit(0), 5000).unref();
}
