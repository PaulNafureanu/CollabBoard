import type { AppContext } from "../context";
import { wireRooms } from "./rooms";

export const wireRealtime = (ctx: AppContext) => {
  wireRooms(ctx);
};
