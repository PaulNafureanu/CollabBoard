import { Prisma } from "../generated/prisma";

export const membershipPublicSelect = {
  id: true,
  userId: true,
  roomId: true,
  role: true,
  status: true,
  joinedAt: true,
  updatedAt: true,
} satisfies Prisma.MembershipSelect;

export type MembershipPublicRaw = Prisma.MembershipGetPayload<{ select: typeof membershipPublicSelect }>;
