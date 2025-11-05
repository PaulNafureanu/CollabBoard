import type { Role, Status } from "@collabboard/shared";
import { ALL_ROLES, ALL_STATUSES, NamespaceType } from "./types";
import type { AppContext } from "../context";

export const SYS_ROOM = "system:announcements";

export const userRoom = (userId: number) => `user:${userId}`;
export const roomRoom = (roomId: number) => `room:${roomId}`;
export const roleRoom = (roomId: number, role: Role) =>
  `role:${roomId}:${role}`;
export const statusRoom = (roomId: number, status: Status) =>
  `status:${roomId}:${status}`;

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

export const Bus = (ctx: AppContext) => ({
  toUsers: (ids: number[]) => ctx.nsp.to(ids.map(userRoom)),
  toRoom: (roomId: number) => ctx.nsp.to(roomRoom(roomId)),
  toRoles: (roomId: number, roles: Role[]) =>
    ctx.nsp.to(roles.map((r) => roleRoom(roomId, r))),
});
