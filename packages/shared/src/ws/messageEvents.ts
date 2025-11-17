import z from "zod";
import { MessagePublicSchema } from "../domain/message";
import { Flag, Id } from "../shared/common";

//message:typing
export const MessageTypingRequestSchema = z
  .object({
    roomId: Id,
    isTyping: Flag,
  })
  .strict();

export type MessageTypingRequest = z.infer<typeof MessageTypingRequestSchema>;

export const MessageTypingBroadcastSchema = z
  .object({
    roomId: Id,
    userId: Id,
    isTyping: Flag,
  })
  .strict();

export type MessageTypingBroadcast = z.infer<typeof MessageTypingBroadcastSchema>;

// message:created
export const MessageCreatedPayloadSchema = z
  .object({
    message: MessagePublicSchema,
  })
  .strict();

export type MessageCreatedPayload = z.infer<typeof MessageCreatedPayloadSchema>;

// message:edited
export const MessageEditedPayloadSchema = z
  .object({
    message: MessagePublicSchema,
  })
  .strict();

export type MessageEditedPayload = z.infer<typeof MessageEditedPayloadSchema>;

// message:deleted
export const MessageDeletedPayloadSchema = z
  .object({
    roomId: Id,
    messageId: Id,
    deletedById: Id,
  })
  .strict();

export type MessageDeletedPayload = z.infer<typeof MessageDeletedPayloadSchema>;
