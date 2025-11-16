import type { MembershipRemovedPayload, MembershipUpdatedPayload } from "./membershipEvents";
import { MessageCreatedPayload, MessageTypingBroadcast, MessageTypingRequest } from "./messageEvents";
import type { PresenceChangedPayload, PresenceChangePayload } from "./presenceEvents";
import type { RoomRenamedPayload } from "./roomEvents";
import type { UserUpdatedPayload } from "./userEvents";

export type SocketEvent<T> = (payload: T) => void;

export type ClientToServerEvents = {
  "presence:join": SocketEvent<PresenceChangePayload>;
  "presence:leave": SocketEvent<PresenceChangePayload>;
  "message:typing": SocketEvent<MessageTypingRequest>;
};

export type ServerToClientEvents = {
  "presence:joined": SocketEvent<PresenceChangedPayload>;
  "presence:left": SocketEvent<PresenceChangedPayload>;
  "user:updated": SocketEvent<UserUpdatedPayload>;
  "room:renamed": SocketEvent<RoomRenamedPayload>;
  "membership:updated": SocketEvent<MembershipUpdatedPayload>;
  "membership:removed": SocketEvent<MembershipRemovedPayload>;
  "message:typing": SocketEvent<MessageTypingBroadcast>;
  "message:created": SocketEvent<MessageCreatedPayload>;
};
