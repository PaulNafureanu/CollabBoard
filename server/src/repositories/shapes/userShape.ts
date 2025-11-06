import { Prisma } from "../../generated/prisma";

export const publicUserSelect = {
  id: true,
  username: true,
  email: true,
  isAnonymous: true,
  createdAt: true,
} satisfies Prisma.UserSelect;

export type PublicUserRow = Prisma.UserGetPayload<{ select: typeof publicUserSelect }>;

export const mapUserRowToPublic = (u: PublicUserRow) => ({
  id: u.id,
  username: u.username ?? `User${u.id}`,
  email: u.email,
  isAnonymous: u.isAnonymous,
  createdAt: u.createdAt.getTime(),
});
