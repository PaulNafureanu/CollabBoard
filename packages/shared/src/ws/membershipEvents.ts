import z from "zod";
import { MembershipPublicSchema } from "../domain/membership";
import { Id, Text } from "../shared/common";

// membership:updated
export const MembershipUpdatedPayloadSchema = z
  .object({
    membership: MembershipPublicSchema,
    updatedById: Id,
    reason: Text.optional(),
  })
  .strict();

export type MembershipUpdatedPayload = z.infer<typeof MembershipUpdatedPayloadSchema>;

// membership:removed
export const MembershipRemovedPayloadSchema = z
  .object({
    roomId: Id,
    userId: Id,
    membershipId: Id,
    removedById: Id,
    reason: Text.optional(),
  })
  .strict();

export type MembershipRemovedPayload = z.infer<typeof MembershipRemovedPayloadSchema>;
