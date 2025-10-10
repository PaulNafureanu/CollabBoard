import * as z from "zod";
import { Id, refineFn, refineMsg } from "./common";

const RoomId = Id;
const Version = Id;
const Payload = z.json();

export const CreateBody = z.object({ roomId: RoomId }).strict();

export const UpdateBody = z
  .object({
    roomId: RoomId.optional(),
    version: Version.optional(),
    payload: Payload.optional(),
  })
  .strict()
  .refine(refineFn, refineMsg);
