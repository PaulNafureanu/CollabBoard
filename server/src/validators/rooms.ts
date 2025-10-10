import * as z from "zod";
import { refineFn, refineMsg } from "./common";

const Slug = z.string().trim().min(1).max(64).optional();
const ActiveBoardId = z.coerce.number().int().positive().optional();

export const CreateBody = z.object({ slug: Slug }).strict();

export const UpdateBody = z
  .object({ slug: Slug, activeBoardId: ActiveBoardId })
  .strict()
  .refine(refineFn, refineMsg);
