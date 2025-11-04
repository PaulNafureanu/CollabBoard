import {
  JoinApprovedType,
  JoinDeniedType,
  JoinPendingType,
  JoinRequestType,
  PublicMembership,
  Role,
  UserBannedType,
  UserJoinedType,
} from "@collabboard/shared";
import { roleRoom, userRoom } from "..";
import { SocketType } from "../../types";

// POST /membership with pending => server emits join_request to Admin / Mods
export async function emitJoinRequest(
  socket: SocketType,
  dbMembership: PublicMembership,
  dbExtra: { username: string },
) {
  const { roomId, id: membershipId, updatedAt } = dbMembership;
  const { username } = dbExtra;

  const userId = socket.data.user.id;
  const at = updatedAt.getTime();

  const payload: JoinRequestType = {
    roomId,
    userId,
    username,
    membershipId,
    at,
  };

  const rooms = [
    roleRoom(roomId, Role.OWNER),
    roleRoom(roomId, Role.MODERATOR),
  ];
  socket.nsp.to(rooms).emit("join_request", payload);
}

export function emitJoinPending(socket: SocketType, roomId: number, at: Date) {
  const userId = socket.data.user.id;
  const room = userRoom(userId);
  const payload: JoinPendingType = { roomId, at: at.getTime() };
  socket.nsp.in(room).emit("join_pending", payload);
}

export function emitJoinApproved(socket: SocketType, roomId: number, at: Date) {
  const userId = socket.data.user.id;
  const room = userRoom(userId);
  const payload: JoinApprovedType = { roomId, at: at.getTime() };
  socket.nsp.in(room).emit("join_approved", payload);
}

// export function emitUserJoined(socket:SocketType, d) {
//     const room = userRoom(socket.data.user.id);
//     const payload:UserJoinedType = {}
// }

export function emitJoinDenied(
  socket: SocketType,
  roomId: number,
  at: Date,
  reason?: string,
) {
  const room = userRoom(socket.data.user.id);
  const payload: JoinDeniedType = { roomId, reason, at: at.getTime() };
  socket.nsp.in(room).emit("join_denied", payload);
}

export function emitUserBanned(
  socket: SocketType,
  roomId: number,
  at: Date,
  reason?: string,
) {
  const room = userRoom(socket.data.user.id);
  const payload: UserBannedType = { roomId, reason, at: at.getTime() };
  socket.nsp.in(room).emit("user_banned", payload);
}

export function emitUserLeft() {}
