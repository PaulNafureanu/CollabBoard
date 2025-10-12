import * as z from "zod";
import { Id, refineFn, refineMsg } from "./common";

const Slug = z.string().trim().min(1).max(64).optional();
const ActiveBoardId = Id;
const ActiveBoardStateId = Id;

export const CreateBody = z.object({ slug: Slug.optional() }).strict();

export const UpdateBody = z
  .object({
    slug: Slug.optional(),
    activeBoardId: ActiveBoardId.optional(),
    activeBoardStateId: ActiveBoardStateId.optional(),
  })
  .strict()
  .refine(refineFn, refineMsg);
