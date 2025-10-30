import type { UserStateType } from "@collabboard/shared";
import { getSocket } from "./socket";

export function onUserState(handler: (p: UserStateType) => void) {
  const socket = getSocket();
  socket.on("user_state", handler);
  return () => socket.off("user_state", handler);
}
