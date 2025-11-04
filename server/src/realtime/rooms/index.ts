import { Role, Status } from "@collabboard/shared";
import type Redis from "ioredis";
import { ALL_ROLES, ALL_STATUSES, type NamespaceType } from "../types";
import { registerEvents } from "./events";

export const userRoom = (userId: number) => `user:${userId}`;
export const roomRoom = (roomId: number) => `room:${roomId}`;
export const roleRoom = (roomId: number, role: Role) =>
  `role:${roomId}:${role}`;
export const statusRoom = (roomId: number, status: Status) =>
  `status:${roomId}:${status}`;
export const SYS_ROOM = "system:announcements";

export const rescopeUserRooms = async (
  nsp: NamespaceType,
  roomId: number,
  userId: number,
  role?: Role,
  status?: Status,
) => {
  const sockets = await nsp.in(userRoom(userId)).fetchSockets();

  for (const socket of sockets) {
    await socket.join(roomRoom(roomId));

    if (role) {
      await Promise.all(
        ALL_ROLES.map((r) => socket.leave(roleRoom(roomId, r))),
      );
      await socket.join(roleRoom(roomId, role));
    }

    if (status) {
      await Promise.all(
        ALL_STATUSES.map((s) => socket.leave(statusRoom(roomId, s))),
      );
      await socket.join(statusRoom(roomId, status));
    }
  }
};

export const wireRooms = (nsp: NamespaceType, redis: Redis) => {
  nsp.on("connection", async (socket) => {
    const userId = socket.data?.user?.id;
    if (!Number.isFinite(userId)) {
      socket.disconnect(true);
      return;
    }

    await socket.join(userRoom(userId));
    await socket.join(SYS_ROOM);

    console.log("[/rooms] connected:", socket.id);
    registerEvents(nsp, socket, redis);
    socket.on("error", (err) => console.error("[/rooms] socket error:", err));
  });
};
