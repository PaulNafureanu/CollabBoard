import * as z from "zod";

export const JsonPathSchema = z.array(z.union([z.string(), z.number()]));
export type JsonPathType = z.infer<typeof JsonPathSchema>;

export const JsonSchema = z.json();
export type JsonType = z.infer<typeof JsonSchema>;
