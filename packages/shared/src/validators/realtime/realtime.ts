import * as z from "zod";

export const Id = z.coerce.number().int().positive();
export const PosNumber = z.number().positive();

export const CursorMoveSchema = z.object({
  roomId: Id,
  userId: Id,
  x: PosNumber,
  y: PosNumber,
  ts: PosNumber,
});
