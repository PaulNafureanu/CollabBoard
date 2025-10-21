import * as z from "zod";
import { Id } from "./common";

const RoomId = Id;

const Copy = z
  .string()
  .trim()
  .toLowerCase()
  .refine((v) => v === "true" || v === "false", {
    message: "copy must be 'true' or 'false'",
  })
  .transform((v) => v === "true");

export const CreateBody = z.object({ roomId: RoomId }).strict();
export const UpdateBody = CreateBody;
export const BoardQuery = z.object({ copy: Copy }).strict();
