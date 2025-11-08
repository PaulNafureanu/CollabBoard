import z from "zod";

export const PublicBoard = z.object({
  id: z.number().int().positive(),
  roomId: z.number().int().positive(),
  name: z.string().min(1),
  createdAt: z.number().int().nonnegative(),
  updatedAt: z.number().int().nonnegative(),
  lastState: z.number().int().positive().nullable(),
});

export type PublicBoardType = z.infer<typeof PublicBoard>;
