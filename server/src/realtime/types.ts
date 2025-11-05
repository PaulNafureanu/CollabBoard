import type { ClientToServerEvents, ServerToClientEvents } from "@collabboard/shared";
import { Role, Status } from "@collabboard/shared";
import type { Namespace, Server, Socket } from "socket.io";
import type { AppContext } from "../context";

export const ALL_STATUSES: Status[] = Object.values(Status);
export const ALL_ROLES: Role[] = Object.values(Role);

export type ServerSideEvents = {};

// export type SocketDataSchema = z.infer<typeof SocketData>;

export type SocketDataSchema = { user: { id: number }; ctx: AppContext };

export type SocketType = Socket<ClientToServerEvents, ServerToClientEvents, ServerSideEvents, SocketDataSchema>;
export type NamespaceType = Namespace<ClientToServerEvents, ServerToClientEvents, ServerSideEvents, SocketDataSchema>;

export type ServerType = Server<ClientToServerEvents, ServerToClientEvents, ServerSideEvents, SocketDataSchema>;
