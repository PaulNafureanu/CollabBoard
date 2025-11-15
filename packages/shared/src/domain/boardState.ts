import z from "zod";
import { Id, MsEpoch } from "../shared/common";
import { JsonSchema } from "../shared/json";

const Version = Id;

export const BoardStatePublicSchema = z
  .object({
    id: Id,
    boardId: Id,
    version: Version,
    payload: JsonSchema,
    createdAt: MsEpoch,
  })
  .strict();

export const BoardStateCreateSchema = z.object({ boardId: Id, version: Version, payload: JsonSchema }).strict();

export type BoardStatePublic = z.infer<typeof BoardStatePublicSchema>;
export type BoardStateCreate = z.infer<typeof BoardStateCreateSchema>;
