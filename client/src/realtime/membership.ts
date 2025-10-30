import type {
  JoinApprovedType,
  JoinDeniedType,
  JoinPendingType,
  JoinRequestType,
  UserBannedType,
  UserJoinedType,
  UserLeftType,
} from "@collabboard/shared";
import { getSocket } from "./socket";

export function onJoinRequest(handler: (p: JoinRequestType) => void) {
  const socket = getSocket();
  socket.on("join_request", handler);
  return () => socket.off("join_request", handler);
}

export function onJoinPending(handler: (p: JoinPendingType) => void) {
  const socket = getSocket();
  socket.on("join_pending", handler);
  return () => socket.off("join_pending", handler);
}

export function onJoinApproved(handler: (p: JoinApprovedType) => void) {
  const socket = getSocket();
  socket.on("join_approved", handler);
  return () => socket.off("join_approved", handler);
}

export function onUserJoined(handler: (p: UserJoinedType) => void) {
  const socket = getSocket();
  socket.on("user_joined", handler);
  return () => socket.off("user_joined", handler);
}

export function onJoinDenied(handler: (p: JoinDeniedType) => void) {
  const socket = getSocket();
  socket.on("join_denied", handler);
  return () => socket.off("join_denied", handler);
}

export function onUserBanned(handler: (p: UserBannedType) => void) {
  const socket = getSocket();
  socket.on("user_banned", handler);
  return () => socket.off("user_banned", handler);
}

export function onUserLeft(handler: (p: UserLeftType) => void) {
  const socket = getSocket();
  socket.on("user_left", handler);
  return () => socket.off("user_left", handler);
}
