// // server-only input shape (trustless)
// const TypingC2S = Typing.omit({ userId: true, at: true });
// type TypingC2SType = z.infer<typeof TypingC2S>; //TODO: narrow server handler inputs example

import type Redis from "ioredis";
import type { NamespaceType, SocketType } from "../types";
import { JoinRoom } from "@collabboard/shared";
import { prisma } from "../../db/prisma";

export const registerEvents = (
  nsp: NamespaceType,
  socket: SocketType,
  redis: Redis,
) => {
  socket.on("join_room", async (raw) => {
    const p = JoinRoom.safeParse(raw);
    if (p.error) return;
    const roomId = p.data.roomId;
    const userId = socket.data.user.id;

    // const membership = await prisma.membership.findUnique({
    //   where: { userId, roomId },
    //   select: { status: true, role: true },
    // });

    // prisma

    // Check if the user is approved with role to be in that room, if so, sent the roomstate to it
  });

  // onJoinRoom(socket, () => {});

  socket.on("disconnect", () => {
    // clean up
  });
};
