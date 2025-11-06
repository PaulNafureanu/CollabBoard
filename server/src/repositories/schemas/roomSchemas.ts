import * as z from "zod";

export const PublicRoom = z.object({
  id: z.number().int().positive(),
  name: z.string().min(1),
  createdAt: z.number().int().nonnegative(),
  updatedAt: z.number().int().nonnegative(),
  activeBoardStateId: z.number().int().positive(),
});

export type PublicRoomType = z.infer<typeof PublicRoom>;
