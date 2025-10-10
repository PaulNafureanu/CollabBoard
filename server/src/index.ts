import "dotenv/config";
import express from "express";
import cors from "cors";

import { main } from "./routes/main";
import { health } from "./routes/health";
import { version } from "./routes/version";

import { users } from "./routes/users";
import { rooms } from "./routes/rooms";
import { memberships } from "./routes/memberships";
import { messages } from "./routes/messages";
import { boards } from "./routes/boards";
import { boardStates } from "./routes/boardStates";

const app = express();

const corsOrigin = process.env.CORS_ORIGIN ?? true;
app.use(cors({ origin: corsOrigin, credentials: true }));

app.use(express.json());

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

// 404
app.use((req, res) => res.status(404).json({ ok: false, error: "Not found" }));

const PORT = process.env.PORT ?? 3000;

app.listen(PORT, () =>
  console.log(`API Server listening on http://localhost:${PORT}`),
);
