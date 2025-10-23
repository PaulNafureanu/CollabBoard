import * as z from "zod";
import Common from "./common";

const Text = z.string().trim().min(1);

const CreateBody = z
  .object({ roomId: Common.Id, userId: Common.Id, text: Text })
  .strict();

const UpdateBody = z.object({ text: Text }).strict();

const Messages = { CreateBody, UpdateBody };

export default Messages;
