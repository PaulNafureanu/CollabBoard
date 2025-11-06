import * as z from "zod";

export const PublicUser = z.object({
  id: z.number().int().positive(),
  username: z.string().min(1),
  email: z.email().nullable(),
  isAnonymous: z.boolean(),
  createdAt: z.number().int().nonnegative(),
});

export type PublicUserType = z.infer<typeof PublicUser>;
