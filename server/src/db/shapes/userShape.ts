import { Prisma } from "../generated/prisma";

export const userPublicSelect = {
  id: true,
  username: true,
  email: true,
  isAnonymous: true,
  createdAt: true,
} satisfies Prisma.UserSelect;

export type UserPublicRow = Prisma.UserGetPayload<{ select: typeof userPublicSelect }>;
