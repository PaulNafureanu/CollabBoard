import type { UserPublic } from "@collabboard/shared";
import type { UserPublicRow } from "../../db";

export const toUserPublic = (u: UserPublicRow): UserPublic => ({
  id: u.id,
  username: u.username ?? `User${u.id}`,
  email: u.email,
  isAnonymous: u.isAnonymous,
  createdAt: u.createdAt.getTime(),
});
