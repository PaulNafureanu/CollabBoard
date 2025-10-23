import { io, Socket } from "socket.io-client";
import type {
  ServerToClientEvents,
  ClientToServerEvents,
} from "@collabboard/shared";

export const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(
  "http://localhost:3000/rooms",
  {
    path: "/socket.io",
    withCredentials: true,
  },
);
