import * as z from "zod";
import { Role as PrismaRole } from "../../../../../server/src/generated/prisma";
import Common from "./common";

const RoleSchema = z.enum(Object.values(PrismaRole));
const RoleCoerced = z
  .string()
  .trim()
  .transform((s) => s.toUpperCase())
  .pipe(RoleSchema);

const CreateBody = z
  .object({
    userId: Common.Id,
    roomId: Common.Id,
    role: RoleCoerced.optional(),
  })
  .strict();

const UpdateBody = z.object({ role: RoleCoerced }).strict();

const Memberships = { CreateBody, UpdateBody };

export default Memberships;
