import { Prisma } from "../../generated/prisma";

export const publicMembershipSelect = {
  id: true,
  userId: true,
  roomId: true,
  role: true,
  status: true,
  joinedAt: true,
  updatedAt: true,
} satisfies Prisma.MembershipSelect;

export type PublicMembershipRaw = Prisma.MembershipGetPayload<{ select: typeof publicMembershipSelect }>;

export const mapMembershipRowToPublic = (m: PublicMembershipRaw) => ({
  id: m.id,
  userId: m.userId,
  roomId: m.roomId,
  role: m.role,
  status: m.status,
  joinedAt: m.joinedAt.getTime(),
  updatedAt: m.updatedAt.getTime(),
});
