import z from "zod";
import { Id, Name } from "../shared/common";

//room:renamed
export const RoomRenamedPayloadSchema = z
  .object({
    roomId: Id,
    name: Name,
  })
  .strict();

export type RoomRenamedPayload = z.infer<typeof RoomRenamedPayloadSchema>;
