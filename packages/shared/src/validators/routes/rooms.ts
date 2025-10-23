import * as z from "zod";
import Common from "./common";

const Slug = z.string().trim().min(1).max(64).optional();
const ActiveBoardStateId = Common.Id;

const CreateBody = z.object({ slug: Slug.optional() }).strict();

const UpdateBody = z
  .object({
    slug: Slug.optional(),
    activeBoardStateId: ActiveBoardStateId.optional(),
  })
  .strict()
  .refine(Common.refineFn, Common.refineMsg);

const Rooms = { CreateBody, UpdateBody };
export default Rooms;
