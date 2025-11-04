import * as z from "zod";
import { Role as PrismaRole } from "../../../../../server/src/generated/prisma";

import Common from "./common";

const RoleSchema = z.enum(Object.values(PrismaRole));
// const StatusSchema = z.enum(Object.values(PrismaStatus));
const StatusSchema = z.enum(["PENDING"]);

const EnumCoerce = z
  .string()
  .trim()
  .transform((s) => s.toUpperCase());

const RoleCoerced = EnumCoerce.pipe(RoleSchema);
const StatusCoerced = EnumCoerce.pipe(StatusSchema);

const CreateBody = z
  .object({
    userId: Common.Id,
    roomId: Common.Id,
    role: RoleCoerced.optional(),
    status: StatusCoerced,
  })
  .strict();

const UpdateBody = z.object({ role: RoleCoerced }).strict();

const Memberships = { CreateBody, UpdateBody };

export default Memberships;
