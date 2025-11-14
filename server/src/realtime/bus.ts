import type { Role, Status } from "@collabboard/shared";
import type { AppContext } from "../context/context";
import { ALL_ROLES, ALL_STATUSES, type NamespaceType } from "./types";

export const SYS_ROOM = "system:announcements";

const uniq = <T>(arr: T[]) => [...new Set(arr)];

export const userRoom = (userId: number) => `user:${userId}`;
export const roomRoom = (roomId: number) => `room:${roomId}`;
export const roleRoom = (roomId: number, role: Role) => `role:${roomId}:${role}`;
export const statusRoom = (roomId: number, status: Status) => `status:${roomId}:${status}`;

export const rescopeUserRooms = async (
  nsp: NamespaceType,
  roomId: number,
  userId: number,
  role?: Role,
  status?: Status,
) => {
  const base = nsp.in(userRoom(userId));

  base.socketsJoin(roomRoom(roomId));

  if (role) {
    base.socketsLeave(ALL_ROLES.map((r) => roleRoom(roomId, r)));
    base.socketsJoin(roleRoom(roomId, role));
  }

  if (status) {
    base.socketsLeave(ALL_STATUSES.map((s) => statusRoom(roomId, s)));
    base.socketsJoin(statusRoom(roomId, status));
  }
};

export const Bus = (ctx: AppContext) => {
  return {
    toUser: (userId: number) => ctx.nsp.to(userRoom(userId)),

    toUsers: (userIds: number[]) => ctx.nsp.to(uniq(userIds.map(userRoom))),

    toRoom: (roomId: number) => ctx.nsp.to(roomRoom(roomId)),

    toRooms: (roomIds: number[]) => ctx.nsp.to(uniq(roomIds.map(roomRoom))),

    toRoles: (roomId: number, roles: Role[]) => ctx.nsp.to(uniq(roles.map((r) => roleRoom(roomId, r)))),

    toStatuses: (roomId: number, statuses: Status[]) => ctx.nsp.to(uniq(statuses.map((s) => statusRoom(roomId, s)))),
  };
};
