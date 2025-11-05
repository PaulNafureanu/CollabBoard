import { AppContext } from "../../context";
import { SYS_ROOM, userRoom } from "../bus";
import { registerEvents } from "./events";

export const wireRooms = (ctx: AppContext) => {
  const { nsp } = ctx;

  nsp.on("connection", async (socket) => {
    // Check user id existence
    const userId = socket.data?.user?.id;
    if (!Number.isFinite(userId)) {
      socket.disconnect(true);
      return;
    }

    // join basic rooms
    await socket.join(userRoom(userId));
    await socket.join(SYS_ROOM);

    // add context to the socket if needed later
    socket.data.ctx = ctx;

    console.log("[/rooms] connected:", socket.id);

    // register all evets
    registerEvents(ctx, socket);

    socket.on("error", (err) => console.error("[/rooms] socket error:", err));
    socket.on("disconnect", (reason) => console.log("[/rooms] socket disconnected:", reason));
  });
};
