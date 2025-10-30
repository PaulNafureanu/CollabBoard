import * as z from "zod";
import Common from "./common";
import { JsonSchema } from "../../common/json";

const BoardId = Common.Id;
const Version = Common.Id;
const Payload = JsonSchema;

const CreateBody = z
  .object({ boardId: BoardId, version: Version, payload: Payload })
  .strict();

const BoardStates = { CreateBody };
export default BoardStates;
