import * as z from "zod";

export const IdParam = z.object({ id: z.coerce.number().int().positive() });

const Username = z.string().trim().min(1).max(64);
const Email = z.email().trim().max(255);
const Password = z.string().min(8).max(255);

const FullCreate = z
  .object({
    username: Username,
    email: Email,
    password: Password,
  })
  .strict();

export const CreateBody = z.union([FullCreate, z.object({}).strict()]);

export const UpdateBody = z
  .object({
    username: Username.optional(),
    email: Email.optional(),
    password: Password.optional(),
  })
  .strict()
  .refine((obj) => Object.keys(obj).length > 0, {
    error: "No changes provided",
  });
