import z from "zod";
import { Id, MsEpoch, PosNumber } from "../shared/common";
import { JsonPathSchema, JsonSchema } from "../shared/json";
import { BoardStatePublicSchema } from "../domain/boardState";

// boardstate:patch
export const BoardStatePatchPayloadSchema = z
  .object({
    roomId: Id,
    boardId: Id,
    boardStateId: Id,
    dbVersion: PosNumber.int(),
    rtVersion: PosNumber.int(),
    patch: z.object({
      path: JsonPathSchema,
      value: JsonSchema,
    }),
  })
  .strict();

export type BoardStatePatch = z.infer<typeof BoardStatePatchPayloadSchema>;

// boardstate:patched

export const BoardStatePatchedPayloadSchema = BoardStatePatchPayloadSchema.extend({
  patchedById: Id,
  at: MsEpoch,
}).strict();

export type BoardStatePatched = z.infer<typeof BoardStatePatchedPayloadSchema>;

// boardstate:save

export const BoardStateSavePayloadSchema = z
  .object({
    roomId: Id,
    boardId: Id,
    boardStateId: Id,
    rtVersion: PosNumber.int(),
    dbVersion: PosNumber.int(),
  })
  .strict();

export type BoardStateSave = z.infer<typeof BoardStateSavePayloadSchema>;

// boardstate:saved

export const BoardStateSavedPayloadSchema = z
  .object({
    roomId: Id,
    boardId: Id,
    savedById: Id,
    rtVersion: PosNumber.int(),
    boardState: BoardStatePublicSchema,
  })
  .strict();

export type BoardStateSaved = z.infer<typeof BoardStateSavedPayloadSchema>;
