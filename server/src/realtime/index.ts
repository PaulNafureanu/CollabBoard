import type Redis from "ioredis";
import type { Server } from "socket.io";
import { wireRooms } from "./rooms";

export const wireRealtime = (io: Server, redis: Redis) => {
  const nsp = io.of("/rooms");
  wireRooms(nsp, redis);
};
