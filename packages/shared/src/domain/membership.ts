import z from "zod";
import { Id, MsEpoch, RoleSchema, StatusSchema } from "../shared/common";

export const MembershipPublicSchema = z
  .object({
    id: Id,
    userId: Id,
    roomId: Id,
    role: RoleSchema,
    status: StatusSchema,
    joinedAt: MsEpoch,
    updatedAt: MsEpoch,
  })
  .strict();

export const MembershipCreateSchema = z
  .object({
    userId: Id,
    roomId: Id,
    role: RoleSchema.optional(),
    status: StatusSchema,
  })
  .strict();

export const MembershipUpdateSchema = z
  .object({ role: RoleSchema.optional(), status: StatusSchema.optional() })
  .strict();

export type MembershipPublic = z.infer<typeof MembershipPublicSchema>;
export type MembershipCreate = z.infer<typeof MembershipCreateSchema>;
export type MembershipUpdate = z.infer<typeof MembershipUpdateSchema>;
