import type Redis from "ioredis";
import type { Namespace } from "socket.io";
import { registerEvents } from "./events";
import {
  ClientToServerEvents,
  ServerToClientEvents,
} from "@collabboard/shared";

export const wireRooms = (
  nsp: Namespace<ClientToServerEvents, ServerToClientEvents>,
  redis: Redis,
) => {
  nsp.on("connection", (socket) => {
    console.log("[/rooms] connected: ", socket.id);
    registerEvents(nsp, socket, redis);
    socket.on("error", (err) => console.error("[/rooms] socket error: ", err));
  });
};
