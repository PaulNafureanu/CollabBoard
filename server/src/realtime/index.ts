import type { Server } from "socket.io";
import type Redis from "ioredis";
import { CursorMoveSchema } from "@collabboard/shared";

export const wireCursor = (io: Server, redis: Redis) => {
  const nsp = io.of("/rooms");

  nsp.on("connection", (socket) => {
    socket.on("cursor_move", async (raw) => {
      // const parsed = CursorMove
    });
  });
};
