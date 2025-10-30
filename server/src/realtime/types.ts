import type {
  ClientToServerEvents,
  ServerToClientEvents,
} from "@collabboard/shared";
import type { Namespace, Server, Socket } from "socket.io";
import * as z from "zod";
import { SocketData } from "./validator";

export type ServerSideEvents = {};

export type SocketDataSchema = z.infer<typeof SocketData>;

export type SocketType = Socket<
  ClientToServerEvents,
  ServerToClientEvents,
  ServerSideEvents,
  SocketDataSchema
>;
export type NamespaceType = Namespace<
  ClientToServerEvents,
  ServerToClientEvents,
  ServerSideEvents,
  SocketDataSchema
>;

export type ServerType = Server<
  ClientToServerEvents,
  ServerToClientEvents,
  ServerSideEvents,
  SocketDataSchema
>;
