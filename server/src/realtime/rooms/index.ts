import type Redis from "ioredis";
import type { NamespaceType } from "../types";
import { registerEvents } from "./events";

export const wireRooms = (nsp: NamespaceType, redis: Redis) => {
  nsp.on("connection", (socket) => {
    console.log("[/rooms] connected: ", socket.id);
    registerEvents(nsp, socket, redis);
    socket.on("error", (err) => console.error("[/rooms] socket error: ", err));
  });
};
