import * as z from "zod";
import { Id } from "./common";

const Text = z.string().trim().min(1);

export const CreateBody = z
  .object({ roomId: Id, userId: Id, text: Text })
  .strict();

export const UpdateBody = z.object({ text: Text }).strict();
