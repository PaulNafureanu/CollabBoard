import * as z from "zod";

export const Id = z.coerce.number().int().positive();
export const IdParam = z.object({ id: Id });

export const refineFn = <T extends object>(obj: T) =>
  Object.keys(obj).length > 0;
export const refineMsg = {
  error: "No changes provided",
};
