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
export type CursorMoveType = z.infer<typeof CursorMove>;
export type RoomStateType = z.infer<typeof RoomState>;
export type JoinRequestType = z.infer<typeof JoinRequest>;
export type JoinPendingType = z.infer<typeof JoinPending>;
export type JoinApprovedType = z.infer<typeof JoinApproved>;
export type UserJoinedType = z.infer<typeof UserJoined>;
export type JoinDeniedType = z.infer<typeof JoinDenied>;
export type UserBannedType = z.infer<typeof UserBanned>;
export type UserLeftType = z.infer<typeof UserLeft>;
export type UserStateType = z.infer<typeof UserState>;
export type JoinRoomType = z.infer<typeof JoinRoom>;
export type ReSyncRoomStateType = z.infer<typeof ReSyncRoomState>;
export type ChatMessageType = z.infer<typeof ChatMessage>;
export type TypingType = z.infer<typeof Typing>;
export type ReSyncBoardStateType = z.infer<typeof ReSyncBoardState>;
export type BoardPatchType = z.infer<typeof BoardPatch>;
export type RoomClosedType = z.infer<typeof RoomClosed>;

// Socket.IO
export type SocketEvent<T> = (payload: T) => void;

export type ClientToServerEvents = {
  cursor_move: SocketEvent<CursorMoveType>;
  join_room: SocketEvent<JoinRoomType>;
  resync_room_state: SocketEvent<ReSyncRoomStateType>;
  typing: SocketEvent<TypingType>;
  board_patch: SocketEvent<BoardPatchType>;
};

export type ServerToClientEvents = {
  cursor_move: SocketEvent<CursorMoveType>;
  room_state: SocketEvent<RoomStateType>;
  join_request: SocketEvent<JoinRequestType>;
  join_pending: SocketEvent<JoinPendingType>;
  join_approved: SocketEvent<JoinApprovedType>;
  user_joined: SocketEvent<UserJoinedType>;
  join_denied: SocketEvent<JoinDeniedType>;
  user_banned: SocketEvent<UserBannedType>;
  user_left: SocketEvent<UserLeftType>;
  user_state: SocketEvent<UserStateType>;
  chat_message: SocketEvent<ChatMessageType>;
  resync_board_state: SocketEvent<ReSyncBoardStateType>;
  typing: SocketEvent<TypingType>;
  board_patch: SocketEvent<BoardPatchType>;
  room_closed: SocketEvent<RoomClosedType>;
};
