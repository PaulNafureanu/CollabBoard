import z from "zod";
import { Flag, Id, MsEpoch, Name } from "../shared/common";

const Email = z.email().trim().min(1).max(255);
const Password = z.string().min(8).max(255);

export const UserPublicSchema = z
  .object({
    id: Id,
    username: Name,
    email: Email.nullable(),
    isAnonymous: Flag,
    createdAt: MsEpoch,
  })
  .strict();

export const UserCreateSchema = z.object({ username: Name, email: Email, password: Password }).strict();

export const UserUpdateSchema = z
  .object({ username: Name.optional(), email: Email.optional(), password: Password.optional() })
  .strict();

export type UserPublic = z.infer<typeof UserPublicSchema>;
export type UserCreate = z.infer<typeof UserCreateSchema>;
export type UserUpdate = z.infer<typeof UserUpdateSchema>;
