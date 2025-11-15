import z from "zod";
import { Id, MsEpoch, Role, Status } from "../shared/common";

export const MembershipPublicSchema = z
  .object({
    id: Id,
    userId: Id,
    roomId: Id,
    role: Role,
    status: Status,
    joinedAt: MsEpoch,
    updatedAt: MsEpoch,
  })
  .strict();

export const MembershipCreateSchema = z
  .object({
    userId: Id,
    roomId: Id,
    role: Role.optional(),
    status: Status,
  })
  .strict();

export const MembershipUpdateSchema = z.object({ role: Role.optional(), status: Status.optional() }).strict();

export type MembershipPublic = z.infer<typeof MembershipPublicSchema>;
export type MembershipCreate = z.infer<typeof MembershipCreateSchema>;
export type MembershipUpdate = z.infer<typeof MembershipUpdateSchema>;
