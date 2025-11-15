import type { MembershipPublic } from "@collabboard/shared";
import type { MembershipPublicRaw } from "../../db";

export const toMembershipPublic = (m: MembershipPublicRaw): MembershipPublic => ({
  id: m.id,
  userId: m.userId,
  roomId: m.roomId,
  role: m.role,
  status: m.status,
  joinedAt: m.joinedAt.getTime(),
  updatedAt: m.updatedAt.getTime(),
});
