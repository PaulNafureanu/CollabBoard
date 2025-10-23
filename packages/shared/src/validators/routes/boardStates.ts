import * as z from "zod";
import Common from "./common";

const BoardId = Common.Id;
const Version = Common.Id;
const Payload = z.json();

const CreateBody = z
  .object({ boardId: BoardId, version: Version, payload: Payload })
  .strict();

const BoardStates = { CreateBody };
export default BoardStates;
