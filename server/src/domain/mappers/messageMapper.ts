import type { MessagePublic } from "@collabboard/shared";
import type { MessagePublicRow } from "../../db";

export const toMessagePublic = (m: MessagePublicRow): MessagePublic => ({
  id: m.id,
  roomId: m.roomId,
  userId: m.userId,
  author: m.author,
  text: m.text,
  createdAt: m.createdAt.getTime(),
});
