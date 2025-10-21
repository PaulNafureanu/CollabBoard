import express from "express";
import { users } from "./routes/users";
import { rooms } from "./routes/rooms";
import { boards } from "./routes/boards";
import { boardStates } from "./routes/boardStates";
import { memberships } from "./routes/memberships";
import { messages } from "./routes/messages";
import { errorHandler, jsonParseGuard } from "./middleware/errors";

export function makeApp() {
  const app = express();
  app.use(express.json());
  app.use(jsonParseGuard);

  app.use("/users", users);
  app.use("/rooms", rooms);
  app.use("/boards", boards);
  app.use("/boardstates", boardStates);
  app.use("/memberships", memberships);
  app.use("/messages", messages);

  app.use(errorHandler);
  return app;
}
