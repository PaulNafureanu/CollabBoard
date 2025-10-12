import * as z from "zod";

export const Id = z.coerce.number().int().positive();
export const IdParam = z.object({ id: Id });

const Page = z.coerce.number().int().min(0).default(0);
const Size = z.coerce.number().int().min(1).max(100).default(20);

export const PageQuery = z.object({ page: Page, size: Size }).strict();

export const refineFn = <T extends object>(obj: T) =>
  Object.keys(obj).length > 0;
export const refineMsg = {
  error: "No changes provided",
};
