// // server-only input shape (trustless)
// const TypingC2S = Typing.omit({ userId: true, at: true });
// type TypingC2SType = z.infer<typeof TypingC2S>; //TODO: narrow server handler inputs example

import type Redis from "ioredis";
import type { NamespaceType, SocketType } from "../types";
import { onJoinRoom } from "./events/room";

export const registerEvents = (
  nsp: NamespaceType,
  socket: SocketType,
  redis: Redis,
) => {
  onJoinRoom(socket);

  socket.on("disconnect", () => {
    // clean up
  });
};
