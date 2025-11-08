import { Prisma } from "../../generated/prisma";

export const publicMessageSelect = {
  id: true,
  roomId: true,
  userId: true,
  author: true,
  text: true,
  createdAt: true,
} satisfies Prisma.MessageSelect;

export type PublicMessageRow = Prisma.MessageGetPayload<{ select: typeof publicMessageSelect }>;

export const mapMessageRowToPublic = (m: PublicMessageRow) => ({
  id: m.id,
  roomId: m.roomId,
  userId: m.userId,
  author: m.author,
  text: m.text,
  createdAt: m.createdAt.getTime(),
});
