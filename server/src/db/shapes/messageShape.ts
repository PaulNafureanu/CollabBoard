import { Prisma } from "../generated/prisma";

export const messagePublicSelect = {
  id: true,
  roomId: true,
  userId: true,
  author: true,
  text: true,
  createdAt: true,
} satisfies Prisma.MessageSelect;

export type MessagePublicRow = Prisma.MessageGetPayload<{ select: typeof messagePublicSelect }>;
