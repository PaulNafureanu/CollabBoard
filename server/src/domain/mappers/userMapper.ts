import type { UserPublicRow } from "../../db";

export const toUserPublic = (u: UserPublicRow) => ({
  id: u.id,
  username: u.username ?? `User${u.id}`,
  email: u.email,
  isAnonymous: u.isAnonymous,
  createdAt: u.createdAt.getTime(),
});
