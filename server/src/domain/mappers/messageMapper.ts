import type { MessagePublicRow } from "../../db";

export const toMessagePublic = (m: MessagePublicRow) => ({
  id: m.id,
  roomId: m.roomId,
  userId: m.userId,
  author: m.author,
  text: m.text,
  createdAt: m.createdAt.getTime(),
});
