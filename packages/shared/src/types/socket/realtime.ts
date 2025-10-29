import * as z from "zod";
import {
  BoardPatch,
  ChatMessage,
  CursorMove,
  JoinApproved,
  JoinDenied,
  JoinPending,
  JoinRequest,
  JoinRoom,
  MsEpoch,
  ReSyncBoardState,
  ReSyncRoomState,
  RoomClosed,
  RoomState,
  Typing,
  UserBanned,
  UserJoined,
  UserLeft,
  UserState,
} from "./../../validators/socket/realtime";

export type MsEpochType = z.infer<typeof MsEpoch>;
export type CursorMoveSchema = z.infer<typeof CursorMove>;
export type RoomStateSchema = z.infer<typeof RoomState>;
export type JoinRequestSchema = z.infer<typeof JoinRequest>;
export type JoinPendingSchema = z.infer<typeof JoinPending>;
export type JoinApprovedSchema = z.infer<typeof JoinApproved>;
export type UserJoinedSchema = z.infer<typeof UserJoined>;
export type JoinDeniedSchema = z.infer<typeof JoinDenied>;
export type UserBannedSchema = z.infer<typeof UserBanned>;
export type UserLeftSchema = z.infer<typeof UserLeft>;
export type UserStateSchema = z.infer<typeof UserState>;
export type JoinRoomSchema = z.infer<typeof JoinRoom>;
export type ReSyncRoomStateSchema = z.infer<typeof ReSyncRoomState>;
export type ChatMessageSchema = z.infer<typeof ChatMessage>;
export type TypingSchema = z.infer<typeof Typing>;
export type ReSyncBoardStateSchema = z.infer<typeof ReSyncBoardState>;
export type BoardPatchSchema = z.infer<typeof BoardPatch>;
export type RoomClosedSchema = z.infer<typeof RoomClosed>;

// Socket.IO
export type SocketEvent<T> = (payload: T) => void;

export type ClientToServerEvents = {
  cursor_move: SocketEvent<CursorMoveSchema>;
  join_room: SocketEvent<JoinRoomSchema>;
  resync_room_state: SocketEvent<ReSyncRoomStateSchema>;
  typing: SocketEvent<TypingSchema>;
  board_patch: SocketEvent<BoardPatchSchema>;
};

export type ServerToClientEvents = {
  cursor_move: SocketEvent<CursorMoveSchema>;
  room_state: SocketEvent<RoomStateSchema>;
  join_request: SocketEvent<JoinRequestSchema>;
  join_pending: SocketEvent<JoinPendingSchema>;
  join_approved: SocketEvent<JoinApprovedSchema>;
  user_joined: SocketEvent<UserJoinedSchema>;
  join_denied: SocketEvent<JoinDeniedSchema>;
  user_banned: SocketEvent<UserBannedSchema>;
  user_left: SocketEvent<UserLeftSchema>;
  user_state: SocketEvent<UserStateSchema>;
  chat_message: SocketEvent<ChatMessageSchema>;
  resync_board_state: SocketEvent<ReSyncBoardStateSchema>;
  typing: SocketEvent<TypingSchema>;
  board_patch: SocketEvent<BoardPatchSchema>;
  room_closed: SocketEvent<RoomClosedSchema>;
};
