import {
  JoinApprovedType,
  JoinDeniedType,
  JoinPendingType,
  JoinRequestType,
  PublicMembership,
  Role,
  UserBannedType,
  UserJoinedType,
  UserLeftType,
} from "@collabboard/shared";
import Redis from "ioredis";
import { roleRoom, roomRoom, userRoom } from "..";
import { MemberService } from "../../../redis/member";
import { PresenceService } from "../../../redis/presence";
import { SocketType } from "../../types";

/**
 * Flow I: User joining and leaving a room:
 *
 * User clicks join room button => POST /memberships with pending => Server emits join_request to Admins & Mods, and join_pending to the user => a) or b)
 * a) Mods approves req => PATCH /memberships with role => Server emits join_approved to user, and user_joined & user_state online to everybody in the room =>
 * On client on join_approved, client calls join_room event => Server sends back room_state.
 * b) Mods denies => DELETE /memberships (or PATCH /memberships with banned) => Server emits join_denied to user (or user_banned).
 *
 * User diconnects (eg.: network drop, tab closed, page refresh) => Server emits user_state offline to everybody in the room.
 * User reconnects => Server emits user_state online to everybody in the room & emits room_state to the user.
 *
 * User clicks leave room button => DELETE /memberships => Server emits user_left to everybody.
 *
 */

// User clicks join room button => POST /memberships with pending
export async function onJoinHttpRequestDB(socket: SocketType, redis: Redis) {}

// User POST /membership with pending => server emits join_request to Admin / Mods
export async function emitJoinRequest(
  socket: SocketType,
  dbMembership: PublicMembership,
  dbExtra: { username: string },
) {
  const { roomId, id: membershipId } = dbMembership;
  const { username } = dbExtra;

  const userId = socket.data.user.id;
  const at = Date.now();

  const payload: JoinRequestType = {
    roomId,
    userId,
    username,
    membershipId,
    at,
  };

  const rooms = [roleRoom(roomId, Role.OWNER), roleRoom(roomId, Role.MODERATOR)];
  socket.nsp.to(rooms).emit("join_request", payload);
}

// User POST /membership with pending => server emits join_pending to user after db persistence
export function emitJoinPending(socket: SocketType, roomId: number) {
  const userId = socket.data.user.id;
  const room = userRoom(userId);
  const payload: JoinPendingType = { roomId, at: Date.now() };
  socket.nsp.in(room).emit("join_pending", payload);
}

// Mods PATCH -> /membership status accepted -> join_approved to user
export async function emitJoinApproved(socket: SocketType, dbMembership: PublicMembership) {
  const { roomId, userId } = dbMembership;
  const room = userRoom(userId);

  const payload: JoinApprovedType = { roomId, at: Date.now() };
  socket.nsp.in(room).emit("join_approved", payload);
}

// Mods PATCH -> /membership status accepted -> user_joined to the room
export function emitUserJoined(socket: SocketType, dbMembership: PublicMembership, dbExtra: { username: string }) {
  const { roomId, id, userId, role, status } = dbMembership;
  const { username } = dbExtra;

  const room = roomRoom(roomId);
  const payload: UserJoinedType = {
    roomId,
    id,
    userId,
    username,
    role,
    status,
    isOnline: true,
    at: Date.now(),
  };

  socket.to(room).emit("user_joined", payload);
}

export function emitJoinDenied(socket: SocketType, roomId: number, at: Date, reason?: string) {
  const room = userRoom(socket.data.user.id);
  const payload: JoinDeniedType = { roomId, reason, at: at.getTime() };
  socket.nsp.in(room).emit("join_denied", payload);
}

export async function emitUserBanned(
  socket: SocketType,
  redis: Redis,
  dbMembership: PublicMembership,
  reason?: string,
) {
  const { roomId, id: membershipId, role, status, updatedAt } = dbMembership;
  const userId = socket.data.user.id;
  const room = userRoom(userId);
  const payload: UserBannedType = { roomId, reason, at: updatedAt.getTime() };
  const memberSrv = new MemberService(redis);
  await memberSrv.set({ roomId, userId, membershipId, role, status });
  socket.nsp.in(room).emit("user_banned", payload);
}

// DELETE membership => emits user_left
export function emitUserLeft(
  socket: SocketType,
  redis: Redis,
  dbMembership: PublicMembership,
  dbExtra: { username: string },
) {
  const { roomId, id, role, status, updatedAt } = dbMembership;
  const { username } = dbExtra;
  const userId = socket.data.user.id;
  const rooms = [roomRoom(roomId), userRoom(userId)];
  // clean redis cache
  // rescope socket rooms

  const payload: UserLeftType = {
    id,
    roomId,
    userId,
    username,
    role,
    status,
    isOnline: false,
    at: updatedAt.getTime(),
  };

  socket.nsp.to(rooms).emit("user_left", payload);
}
