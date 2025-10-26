/**
 * Flows:
 *
 * Flow I:
 * User request joins -> POST /memberships -> S emit join_request to Admins/Mods & emit join_pending to User -> a) or b)
 * a) Admin approves -> PATCH /memberships -> S emit join_approved to User & emit user_joined to everybody else ->
 * On user join_approved client calls socket join_room -> server sends room_state (redis) to user
 * b) Admin denies -> DELETE /memberships -> S emit join_denied to User
 *
 *
 * Flow II:
 *
 *
 */

// S To Admins / Mods
export type JoinRequest = {
  roomId: number;
  userId: number;
  username: string;
  at: number;
};

// S To User
export type JoinPending = {
  roomId: number;
  membershipId: number;
};

// S To User
export type JoinApproved = {
  roomId: number;
};

// S To User
export type JoinDenied = {
  roomId: number;
};

// Broadcast to room on approval
export type UserJoined = {
  roomId: number;
  userId: number;
  username: string;
  joinedAt: number;
};

// ───── Joining & state ─────

// Client → Server
export type JoinRoom = {
  roomId: number;
};

export type UserData = {
  userId: number;
  username: string;
};

// Server → Client (hydrate just-joined client)
export type RoomState = {
  roomId: number;
  members: UserData[];
  cursors: CursorMove[];
  //TODO: Extend with: recentMessages, boardMeta, etc.
};

// ───── Ephemeral realtime ─────

//TODO: 30fps max from client (throttle on client; rate-limit on server)
export type CursorMove = {
  roomId: number;
  userId: number;
  x: number;
  y: number;
  ts: number;
};

// ───── Socket.IO typings ─────

export type ClientToServerEvents = {
  join_room: (payload: JoinRoom, ack?: (ok: true) => void) => void;
  cursor_move: (payload: CursorMove) => void;
};

export type ServerToClientEvents = {
  // New user joins room lifecycle
  join_request: (payload: JoinRequest) => void; // to mods
  join_pending: (payload: JoinPending) => void; // to requester
  join_approved: (payload: JoinApproved) => void; // to requester
  join_denied: (payload: JoinDenied) => void; // to requester

  // Presence
  user_joined: (payload: UserJoined) => void; // to room
  room_state: (payload: RoomState) => void; // to the joiner

  // Ephemerals
  cursor_move: (payload: CursorMove) => void;
};
