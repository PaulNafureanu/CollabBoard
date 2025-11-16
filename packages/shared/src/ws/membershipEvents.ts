import z from "zod";
import { Id, RoleSchema, StatusSchema } from "../shared/common";
import { MembershipPublicSchema } from "../domain/membership";

// membership:updated
export const MembershipUpdatedPayloadSchema = z
  .object({
    membership: MembershipPublicSchema,
  })
  .strict();

export type MembershipUpdatedPayload = z.infer<typeof MembershipUpdatedPayloadSchema>;

// membership:removed
export const MembershipRemovedPayloadSchema = z
  .object({
    roomId: Id,
    userId: Id,
    membershipId: Id,
  })
  .strict();

export type MembershipRemovedPayload = z.infer<typeof MembershipRemovedPayloadSchema>;
