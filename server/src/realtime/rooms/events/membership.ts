import {
  JoinPendingType,
  JoinRequestType,
  PublicMembership,
  Role,
} from "@collabboard/shared";
import { roleRoom, userRoom } from "..";
import { SocketType } from "../../types";

// POST /membership with pending => server emits join_request to Admin / Mods
export async function emitJoinRequest(
  socket: SocketType,
  dbMembership: PublicMembership,
  dbExtra: { username: string },
) {
  const { roomId, id, updatedAt } = dbMembership;
  const { username } = dbExtra;

  const userId = socket.data.user.id;
  const membershipId = id;
  //TODO: check the conversion from datatime string to number
  const at = Number(updatedAt);
  const rooms = [
    roleRoom(roomId, Role.OWNER),
    roleRoom(roomId, Role.MODERATOR),
  ];

  const payload: JoinRequestType = {
    roomId,
    userId,
    username,
    membershipId,
    at,
  };
  socket.to(rooms).emit("join_request", payload);
}

export function emitJoinPending(
  socket: SocketType,
  roomId: number,
  at: string, //Question: what type does prisma db gives back for datatime
) {
  const userId = socket.data.user.id;
  const room = userRoom(userId);
  const payload: JoinPendingType = { roomId, at: Number(at) };
  socket.to(room).emit("join_pending", payload);
}
