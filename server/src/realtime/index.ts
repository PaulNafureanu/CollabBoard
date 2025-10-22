import type { Server } from "socket.io";
import type Redis from "ioredis";
import { CursorMoveSchema } from "@collabboard/shared";

export const wireCursor = (io: Server, redis: Redis) => {
  const nsp = io.of("/rooms");

  nsp.on("connection", (socket) => {
    socket.on("cursor_move", async (raw) => {
      // const parsed = CursorMove

      const parsed = CursorMoveSchema.safeParse(raw);
      if (!parsed.success) return;

      const data = parsed.data;

      const roomId = data.roomId.toString();
      socket.join(roomId);

      await redis.set(
        `cursor:${data.roomId}:${data.userId}`,
        JSON.stringify(data),
        "EX",
        30,
      );

      socket.to(roomId).emit("cursor_move", data);
    });
  });
};
