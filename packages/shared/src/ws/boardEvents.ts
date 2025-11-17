import z from "zod";
import { BoardPublicSchema } from "../domain/board";
import { Id, Name } from "../shared/common";

// Copy / Move op via deleted & created events

// board:created
export const BoardCreatedPayloadSchema = z
  .object({
    board: BoardPublicSchema,
    createdById: Id,
  })
  .strict();

export type BoardCreatedPayload = z.infer<typeof BoardCreatedPayloadSchema>;

// board:updated
export const BoardUpdatedPayloadSchema = z
  .object({
    roomId: Id,
    boardId: Id,
    name: Name,
    updatedById: Id,
  })
  .strict();

export type BoardUpdatedPayload = z.infer<typeof BoardUpdatedPayloadSchema>;

// board:deleted
export const BoardDeletedPayloadSchema = z
  .object({
    roomId: Id,
    boardId: Id,
    deletedById: Id,
  })
  .strict();

export type BoardDeletedPayload = z.infer<typeof BoardDeletedPayloadSchema>;
