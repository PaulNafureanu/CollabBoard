import type { AppContext } from "../context/context";
import { wireRooms } from "./rooms";

export const wireRealtime = (ctx: AppContext) => {
  wireRooms(ctx);
};
