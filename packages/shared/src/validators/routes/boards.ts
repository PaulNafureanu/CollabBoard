import * as z from "zod";
import Common from "./common";

const RoomId = Common.Id;

const Copy = z
  .string()
  .trim()
  .toLowerCase()
  .refine((v) => v === "true" || v === "false", {
    message: "copy must be 'true' or 'false'",
  })
  .transform((v) => v === "true");

const CreateBody = z.object({ roomId: RoomId }).strict();
const UpdateBody = CreateBody;
const BoardQuery = z.object({ copy: Copy }).strict();

const Boards = { CreateBody, UpdateBody, BoardQuery };
export default Boards;
