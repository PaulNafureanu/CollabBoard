import {
  ClientToServerEvents,
  CursorMoveSchema,
  ServerToClientEvents,
} from "@collabboard/shared";
import type Redis from "ioredis";
import type { Namespace, Socket } from "socket.io";

export const registerEvents = (
  nsp: Namespace<ClientToServerEvents, ServerToClientEvents>,
  socket: Socket<ClientToServerEvents, ServerToClientEvents>,
  redis: Redis,
) => {
  socket.on("cursor_move", async (raw) => {
    const parsed = CursorMoveSchema.safeParse(raw);
    if (!parsed.success) return;

    const data = parsed.data;

    const roomId = data.roomId.toString();
    socket.join(roomId);

    socket.to(roomId).emit("cursor_move", data);
  });

  socket.on("disconnect", () => {
    // clean up
  });
};
