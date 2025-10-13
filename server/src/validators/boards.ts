import * as z from "zod";
import { Id } from "./common";

const RoomId = Id;

const Copy = z.coerce.boolean().default(false);

export const CreateBody = z.object({ roomId: RoomId }).strict();
export const UpdateBody = CreateBody;
export const BoardQuery = z.object({ copy: Copy }).strict();
