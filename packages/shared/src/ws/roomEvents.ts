import z from "zod";
import { Id, Name, Text } from "../shared/common";

//room:renamed
export const RoomRenamedPayloadSchema = z
  .object({
    roomId: Id,
    name: Name,
    renamedById: Id,
  })
  .strict();

export type RoomRenamedPayload = z.infer<typeof RoomRenamedPayloadSchema>;

//room:deleted
export const RoomDeletedPayloadSchema = z.object({ roomId: Id, deletedById: Id, reason: Text.optional() }).strict();

export type RoomDeletedPayload = z.infer<typeof RoomDeletedPayloadSchema>;
