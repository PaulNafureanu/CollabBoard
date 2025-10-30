import { Id } from "@collabboard/shared";
import * as z from "zod";

const User = z.object({ id: Id });

export const SocketData = z.object({
  user: User,
});
