// // server-only input shape (trustless)
// const TypingC2S = Typing.omit({ userId: true, at: true });
// type TypingC2SType = z.infer<typeof TypingC2S>; //TODO: narrow server handler inputs example

import { AppContext } from "../../context";
import { onJoinRoom } from "./events/room";

export const registerEvents = (ctx: AppContext) => {
  // const socket=  ctx.nsp.
  // onJoinRoom(socket);
  // socket.on("disconnect", () => {
  //   // clean up
  // });
};
