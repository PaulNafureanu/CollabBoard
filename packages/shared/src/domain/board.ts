import z from "zod";
import { Id, MsEpoch, Name } from "../shared/common";

export const BoardPublicSchema = z
  .object({
    id: Id,
    roomId: Id,
    name: Name,
    createdAt: MsEpoch,
    updatedAt: MsEpoch,
    lastState: Id.nullable(),
  })
  .strict();

export const BoardCreateSchema = z.object({ roomId: Id, name: Name.optional() }).strict();

export const BoardUpdateSchema = BoardCreateSchema;

export type BoardPublic = z.infer<typeof BoardPublicSchema>;
export type BoardCreate = z.infer<typeof BoardCreateSchema>;
export type BoardUpdate = z.infer<typeof BoardUpdateSchema>;
