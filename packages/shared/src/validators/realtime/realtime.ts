import * as z from "zod";

/**
 * General validators
 */

export const Id = z.coerce.number().int().positive();
export const MsEpoch = z.number().int().nonnegative(); //TODO: Prefer server time for 'at' fields
const PosNumber = z.number().nonnegative();
const Name = z.string().trim().min(1).max(64);
const Role = z.enum([
  "OWNER",
  "MODERATOR",
  "EDITOR",
  "MEMBER",
  "VIEWER",
  "PENDING",
  "BANNED",
]);

const RoomMember = z.object({
  userId: Id,
  username: Name,
  role: Role,
  isOnline: z.boolean(), //TODO: ensure that isOnline switches only when the tab closes (not on tab switch)
});

const ExtendedRoomMember = RoomMember.extend({ roomId: Id, at: MsEpoch });

const Cursor = z.object({
  userId: Id,
  x: PosNumber,
  y: PosNumber,
  at: MsEpoch,
});

const Message = z.object({
  id: Id,
  userId: Id,
  username: Name,
  text: z.string().trim().min(1),
  at: MsEpoch,
});

const BoardState = z.object({
  id: Id,
  boardId: Id,
  boardName: Name,
  version: Id,
  payload: z.json(),
});

// Broadcast to the room
export const CursorMove = Cursor.extend({ roomId: Id });

// Sent to the requester
export const RoomState = z.object({
  roomId: Id,
  name: Name,
  members: z.array(RoomMember),
  cursors: z.array(Cursor),
  messages: z.array(Message),
  boardState: BoardState,
});

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

// Server to Client

// Sent to admins & mods
export const JoinRequest = z.object({
  roomId: Id,
  userId: Id,
  username: Name,
  membershipId: Id,
  at: MsEpoch,
});

// Sent to the requester
export const JoinPending = z.object({
  roomId: Id,
  at: MsEpoch,
});

// Sent to the requester
export const JoinApproved = z.object({
  roomId: Id,
  at: MsEpoch,
});

// Broadcast to the room
export const UserJoined = ExtendedRoomMember;

// Sent to the requester
export const JoinDenied = z.object({
  roomId: Id,
  reason: z.string().optional(),
  at: MsEpoch,
});

// Sent to the requester
export const UserBanned = z.object({
  roomId: Id,
  reason: z.string().optional(),
  at: MsEpoch,
});

// Broadcast to the room
export const UserLeft = ExtendedRoomMember;

// Broadcast to the room when the online/offline state changes for an user
export const UserState = ExtendedRoomMember;

// Client to Server

//TODO: Make sure the server rejects the event if: membership still pending or banned (To not expose room state).
export const JoinRoom = z.object({
  roomId: Id,
});

export const ReSyncRoomState = z.object({
  roomId: Id,
});

/**
 * Flow II: User sends a message:
 *
 * User types in chat => Client emits typing event true to server => Server broadcast the typing event to the room => a) or b)
 * a) User doesnt sends the message, stops typing after a set time or deletes its message =>
 *  Client sends a typing event false to the server => Server broadcasts the event to the room.
 * b) User sends the message => Client sents a typing event false to server, and POST /messages =>
 * Server broadcasts the typing event, and handles the POST request => Server emits chat_message event to the room after DB persistence.
 * //TODO: Server should send the last 50 chat messages and store/update them in redis for fast retrival.
 *
 */

// Server to client

// Broadcasts to the room
export const ChatMessage = Message.extend({ roomId: Id });

// Bidirectional
export const Typing = z.object({
  roomId: Id,
  isTyping: z.boolean(),
  at: MsEpoch,
});

/**
 * Flow III: Admin, mods or editors change the active board state:
 * Editors modify board states (eg. add new shape/path, edit text) => Client emits a board_patch event to the Server =>
 * The patch data is stored in redis cache and broadcasted in realtime to the room (via board_patch) =>
 * After a set time (or if the editor click save button), the updated board state is persisted in db =>
 * Server broadcasts the new boardstate to the room via resync_board_state.
 *
 */

// Server to Client

// Broadcasts to the room
export const ReSyncBoardState = BoardState.extend({ roomId: Id, at: MsEpoch });

// Bidirectional
export const BoardPatch = {
  roomId: Id,
  boardStateId: Id,

  patch: {
    path: z.unknown(),
    value: z.json(),
  },

  at: MsEpoch,
};
