import z from "zod";
import { Id, MsEpoch, PosNumber } from "../shared/common";

// cursor:move
export const CursorMovePayloadSchema = z
  .object({
    roomId: Id,
    x: PosNumber,
    y: PosNumber,
  })
  .strict();

export type CursorMovePayload = z.infer<typeof CursorMovePayloadSchema>;

// cursor:moved
export const CursorMovedPayloadSchema = CursorMovePayloadSchema.extend({ userId: Id, at: MsEpoch }).strict();

export type CursorMovedPayload = z.infer<typeof CursorMovedPayloadSchema>;
