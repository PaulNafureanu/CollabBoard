import type Redis from "ioredis";
import { wireRooms } from "./rooms";
import type { ServerType } from "./types";

export const wireRealtime = (io: ServerType, redis: Redis) => {
  const nsp = io.of("/rooms");
  wireRooms(nsp, redis);
};
