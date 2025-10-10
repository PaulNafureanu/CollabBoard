import * as z from "zod";
import { Id } from "./common";

const BoardId = Id;
const Version = Id;
const Payload = z.json();

export const CreateBody = z
  .object({ boardId: BoardId, version: Version, payload: Payload })
  .strict();
