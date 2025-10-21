import express from "express";
import { users } from "./routes/users";
import { rooms } from "./routes/rooms";
import { boards } from "./routes/boards";
import { boardStates } from "./routes/boardStates";
import { memberships } from "./routes/memberships";
import { messages } from "./routes/messages";

export function makeApp() {
  const app = express();
  app.use(express.json());
  app.use("/users", users);
  app.use("/rooms", rooms);
  app.use("/boards", boards);
  app.use("/boardstates", boardStates);
  app.use("/memberships", memberships);
  app.use("/messages", messages);
  // simple error handler so tests see 500s instead of crashing
  app.use((err: any, _req: any, res: any, _next: any) => {
    res.status(500).json({ error: String(err?.message ?? err) });
  });
  return app;
}
