import { Role } from "./routes";

/**
 * Event flows:
 *
 * 1. User joining a room:
 *
 * User clicks join button => POST /memberships with pending => Server emits join_request to Admins & Mods, and join_pending to the user => a) or b)
 * a) Mods approves req => PATCH /memberships with role => Server emits join_approved to user, and user_joined to everybody in the room =>
 * On user join_approved, client calls send_room_state event => Server sends back room_state.
 * b) Mods denies => DELETE /memberships (or PATCH /memberships with banned) => Server emits join_denied to user.
 * TODO: rate limiting on retries and automatic denied if user banned, and even account suspended/blocked for spam.
 *
 * 2. User sends a message:
 * User types in chat => Client emits typing event true to server => Server broadcast the typing event to the room => a) or b)
 * a) User doesnt sends the message, stops typing after a set time or deletes its message => Client sends a typing event false to the server => Server broadcasts the event to the room.
 * b) User sends the message => Client sents a typing event false to server, and POST /messages => Server broadcasts the typing event, and handles the POST request =>
 * Server emits chat_message event to the room after DB persistence.
 * TODO: Server should send the last 50 chat messages and store/update them in redis for fast retrival.
 *
 * 3. Admin changes room metadata:
 *
 * 4. Admin/Mods change users' roles:
 *
 * 5. Admin/Mods/Editors change board states:
 *
 *
 */

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
  metadata: RoomMetaDataChange;
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

export type SendRoomState = {
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
  join_room: SocketEvent<SendRoomState>;
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
