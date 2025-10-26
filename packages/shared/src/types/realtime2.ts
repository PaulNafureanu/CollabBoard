import { Role } from "./routes";

export type Id = number;
export type MsEpoch = number;

export type UserRef = {
  userId: Id;
  username: string;
};

// 1 --- Operational

export type RoomMetaDataChange = {
  roomId: Id;
  slug?: string;
  activeBoardStateId?: Id;
  at: MsEpoch;
};

export type RoomMember = {
  userId: Id;
  username: string;
  role: Role;
};

export type CursorMove = {
  roomId: Id;
  x: number;
  y: number;
  at: MsEpoch;
};

export type RoomState = {
  roomId: Id;
  members: RoomMember[];
  cursors: CursorMove[];
};

// 2 --- Membership / Access Control

export type JoinRequest = {
  roomId: Id;
  username: string;
  at: MsEpoch;
};

export type JoinPending = {
  roomId: Id;
  membershipId: Id;
  at: MsEpoch;
};

export type JoinApproved = {
  roomId: Id;
  at: MsEpoch;
};

export type JoinDenied = {
  roomId: Id;
  reason?: string;
  at: MsEpoch;
};

export type UserJoined = {
  roomId: Id;
  username: string;
  at: MsEpoch;
};

export type UserLeft = {
  roomId: Id;
  username: string;
  at: MsEpoch;
};

export type JoinedRoom = {
  roomId: Id;
};

// 3 --- Chat / Communication

export type ChatMessage = {
  id: Id;
  roomId: Id;
  userId: Id;
  username: string;
  test: string;
  at: MsEpoch;
};

export type Typing = {
  roomId: Id;
  isTyping: boolean;
  at: MsEpoch;
};

// 4 --- Board Collab (dif bassed, realtime)

export type BoardPatch = {
  roomId: Id;
  boardId: Id;

  patch: {
    path: unknown;
    value: unknown;
  };

  at: MsEpoch;
};

// Socket.IO

export type SocketEvent<T> = (payload: T) => void;

export type ClientToServerEvents = {
  join_room: SocketEvent<JoinedRoom>;
  typing: SocketEvent<Typing>;
  cursor_move: SocketEvent<CursorMove>;
  board_patch: SocketEvent<BoardPatch>;
};

export type ServerToClientEvents = {
  room_metadata_change: SocketEvent<RoomMetaDataChange>;
  join_request: SocketEvent<JoinRequest>;
  join_pending: SocketEvent<JoinPending>;
  join_approved: SocketEvent<JoinApproved>;
  join_denied: SocketEvent<JoinDenied>;
  user_joined: SocketEvent<UserJoined>;
  user_left: SocketEvent<UserLeft>;
  chat_message: SocketEvent<ChatMessage>;
  typing: SocketEvent<Typing>;
  room_state: SocketEvent<RoomState>;
  board_patch: SocketEvent<BoardPatch>;
  cursor_move: SocketEvent<CursorMove>;
};
