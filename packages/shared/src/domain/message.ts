import z from "zod";
import { Id, MsEpoch, Name, Text } from "../shared/common";

export const MessagePublicSchema = z
  .object({
    id: Id,
    roomId: Id,
    userId: Id.nullable(),
    author: Name,
    text: Text,
    createdAt: MsEpoch,
  })
  .strict();

export const MessageCreateSchema = z.object({ roomId: Id, userId: Id, text: Text }).strict();

export const MessageUpdateSchema = z.object({ text: Text }).strict();

export type MessagePublic = z.infer<typeof MessagePublicSchema>;
export type MessageCreate = z.infer<typeof MessageCreateSchema>;
export type MessageUpdate = z.infer<typeof MessageUpdateSchema>;
