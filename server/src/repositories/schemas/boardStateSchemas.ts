import * as z from "zod";

export const PublicBoardState = z.object({
  id: z.number().int().positive(),
  boardId: z.number().int().positive(),
  version: z.number().int().positive(),
  payload: z.json(),
  createdAt: z.number().int().nonnegative(),
});

export type PublicBoardStateType = z.infer<typeof PublicBoardState>;
