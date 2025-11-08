import z from "zod";

export const PublicMembership = z.object({
  id: z.number().int().positive(),
  userId: z.number().int().positive(),
  roomId: z.number().int().positive(),
  role: z.string().min(1),
  status: z.string().min(1),
  joinedAt: z.number().int().nonnegative(),
  updatedAt: z.number().int().nonnegative(),
});

export type PublicMembershipType = z.infer<typeof PublicMembership>;
