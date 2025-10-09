import "dotenv/config";
import express from "express";
import cors from "cors";

import { main } from "./routes/main";
import { health } from "./routes/health";
import { version } from "./routes/version";

import { user } from "./routes/user";
import { room } from "./routes/room";
import { membership } from "./routes/membership";
import { message } from "./routes/message";
import { board } from "./routes/board";

const app = express();

const corsOrigin = process.env.CORS_ORIGIN ?? true;
app.use(cors({ origin: corsOrigin, credentials: true }));

app.use(express.json());

// Routes
app.use(main);
app.use(health);
app.use(version);
app.use("/user", user);
app.use("/room", room);
app.use("/membership", membership);
app.use("/message", message);
app.use("/board", board);

// 404
app.use((req, res) => res.status(404).json({ ok: false, error: "Not found" }));

const PORT = process.env.PORT ?? 3000;

app.listen(PORT, () =>
  console.log(`API Server listening on http://localhost:${PORT}`),
);
