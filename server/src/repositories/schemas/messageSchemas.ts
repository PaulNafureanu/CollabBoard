import z from "zod";

export const PublicMessage = z.object({
  id: z.number().int().positive(),
  roomId: z.number().int().positive(),
  userId: z.number().int().positive().nullable(),
  author: z.string().min(1),
  text: z.string().min(1),
  createdAt: z.number().int().nonnegative(),
});

export type PublicMessageType = z.infer<typeof PublicMessage>;
