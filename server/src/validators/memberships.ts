import * as z from "zod";
import { Role as PrismaRole } from "../generated/prisma";
import { Id } from "./common";

const RoleSchema = z.enum(Object.values(PrismaRole));
const RoleCoerced = z
  .string()
  .trim()
  .transform((s) => s.toUpperCase())
  .pipe(RoleSchema);

export const CreateBody = z
  .object({ userId: Id, roomId: Id, role: RoleCoerced.optional() })
  .strict();

export const UpdateBody = z.object({ role: RoleCoerced }).strict();
