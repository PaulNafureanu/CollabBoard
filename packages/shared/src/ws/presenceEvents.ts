import z from "zod";
import { Id } from "../shared/common";

/**
 * presence:join
 * presence:leave
 */
export const PresenceChangePayloadSchema = z
  .object({
    roomId: Id,
  })
  .strict();

export type PresenceChangePayload = z.infer<typeof PresenceChangePayloadSchema>;

/**
 * presence:joined
 * presence:left
 */
export const PresenceChangedPayloadSchema = z
  .object({
    userId: Id,
    roomId: Id,
  })
  .strict();

export type PresenceChangedPayload = z.infer<typeof PresenceChangedPayloadSchema>;
