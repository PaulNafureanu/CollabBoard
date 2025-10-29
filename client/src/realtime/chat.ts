import type { ChatMessageSchema, TypingSchema } from "@collabboard/shared";
import { getSocket } from "./socket";

export function emitTyping(roomId: number, userId: number, isTyping: boolean) {
  const payload: TypingSchema = { roomId, userId, isTyping, at: Date.now() };
  getSocket().emit("typing", payload);
}

export function onTyping(handler: (p: TypingSchema) => void) {
  const socket = getSocket();
  socket.on("typing", handler);
  return () => socket.off("typing", handler);
}

export function onChatMessage(handler: (p: ChatMessageSchema) => void) {
  const socket = getSocket();
  socket.on("chat_message", handler);
  return () => socket.off("chat_message", handler);
}
