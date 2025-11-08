import { ZodObject } from "zod";

export const parseMany = <PublicRow, PublicType, R>(
  rows: PublicRow[],
  map: (s: PublicRow) => R,
  validator: ZodObject,
): PublicType[] => {
  const out: PublicType[] = [];

  for (const row of rows) {
    const dto = map(row);
    const parsed = validator.safeParse(dto);
    if (parsed.success) out.push(parsed.data as PublicType);
    else {
      console.warn("Invalid boarState DTO skipped: ", parsed.error);
    }
  }

  return out;
};
