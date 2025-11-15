import z from "zod";
import { Id, MsEpoch, Name } from "../shared/common";

export const RoomPublicSchema = z
  .object({
    id: Id,
    name: Name,
    createdAt: MsEpoch,
    updatedAt: MsEpoch,
    activeBoardStateId: Id.nullable(),
  })
  .strict();

export const RoomCreateSchema = z.object({ name: Name.optional() }).strict();

export const RoomUpdateSchema = z.object({ name: Name.optional(), activeBoardStateId: Id.optional() }).strict();

export type RoomPublic = z.infer<typeof RoomPublicSchema>;
export type RoomCreate = z.infer<typeof RoomCreateSchema>;
export type RoomUpdate = z.infer<typeof RoomUpdateSchema>;
