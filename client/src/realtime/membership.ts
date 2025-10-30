import type {
  JoinApprovedSchema,
  JoinDeniedSchema,
  JoinPendingSchema,
  JoinRequestSchema,
  UserBannedSchema,
  UserJoinedSchema,
  UserLeftSchema,
} from "@collabboard/shared";
import { getSocket } from "./socket";

export function onJoinRequest(handler: (p: JoinRequestSchema) => void) {
  const socket = getSocket();
  socket.on("join_request", handler);
  return () => socket.off("join_request", handler);
}

export function onJoinPending(handler: (p: JoinPendingSchema) => void) {
  const socket = getSocket();
  socket.on("join_pending", handler);
  return () => socket.off("join_pending", handler);
}

export function onJoinApproved(handler: (p: JoinApprovedSchema) => void) {
  const socket = getSocket();
  socket.on("join_approved", handler);
  return () => socket.off("join_approved", handler);
}

export function onUserJoined(handler: (p: UserJoinedSchema) => void) {
  const socket = getSocket();
  socket.on("user_joined", handler);
  return () => socket.off("user_joined", handler);
}

export function onJoinDenied(handler: (p: JoinDeniedSchema) => void) {
  const socket = getSocket();
  socket.on("join_denied", handler);
  return () => socket.off("join_denied", handler);
}

export function onUserBanned(handler: (p: UserBannedSchema) => void) {
  const socket = getSocket();
  socket.on("user_banned", handler);
  return () => socket.off("user_banned", handler);
}

export function onUserLeft(handler: (p: UserLeftSchema) => void) {
  const socket = getSocket();
  socket.on("user_left", handler);
  return () => socket.off("user_left", handler);
}
