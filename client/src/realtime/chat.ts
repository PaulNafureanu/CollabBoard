import type { ChatMessageType, TypingType } from "@collabboard/shared";
import { getSocket } from "./socket";

export function emitTyping(roomId: number, userId: number, isTyping: boolean) {
  const payload: TypingType = { roomId, userId, isTyping, at: Date.now() };
  getSocket().emit("typing", payload);
}

export function onTyping(handler: (p: TypingType) => void) {
  const socket = getSocket();
  socket.on("typing", handler);
  return () => socket.off("typing", handler);
}

export function onChatMessage(handler: (p: ChatMessageType) => void) {
  const socket = getSocket();
  socket.on("chat_message", handler);
  return () => socket.off("chat_message", handler);
}
