import * as z from "zod";

const Id = z.coerce.number().int().positive();
const IdParam = z.object({ id: Id });
const Name = z.string().trim().min(1).max(64);

const Page = z.coerce.number().int().min(0).default(0);
const Size = z.coerce.number().int().min(1).max(100).default(20);

const PageQuery = z.object({ page: Page, size: Size }).strict();

const refineFn = <T extends object>(obj: T) => Object.keys(obj).length > 0;
const refineMsg = {
  error: "No changes provided",
};

const Common = {
  Id,
  IdParam,
  Name,
  Page,
  Size,
  PageQuery,
  refineFn,
  refineMsg,
};
export default Common;
