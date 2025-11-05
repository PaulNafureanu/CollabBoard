import { Role, Status } from "@collabboard/shared";
import { AppContext } from "../../context";
import { ALL_ROLES, ALL_STATUSES, type NamespaceType } from "../types";
import { registerEvents } from "./events";

export const wireRooms = (ctx: AppContext) => {
  ctx.nsp.on("connection", async (socket) => {
    const userId = socket.data?.user?.id;
    if (!Number.isFinite(userId)) {
      socket.disconnect(true);
      return;
    }

    await socket.join(userRoom(userId));
    await socket.join(SYS_ROOM);

    console.log("[/rooms] connected:", socket.id);
    registerEvents(nsp, socket, redis);
    socket.on("error", (err) => console.error("[/rooms] socket error:", err));
  });
};
