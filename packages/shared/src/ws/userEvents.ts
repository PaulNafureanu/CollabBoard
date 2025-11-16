import z from "zod";
import { Id, Name } from "../shared/common";

//user:updated
export const UserUpdatedPayloadSchema = z
  .object({
    userId: Id,
    username: Name,
  })
  .strict();

export type UserUpdatedPayload = z.infer<typeof UserUpdatedPayloadSchema>;
