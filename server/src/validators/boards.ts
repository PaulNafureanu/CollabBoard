import * as z from "zod";
import { Id } from "./common";

const RoomId = Id;

export const CreateBody = z.object({ roomId: RoomId }).strict();
export const UpdateBody = CreateBody;
