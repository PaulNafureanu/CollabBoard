import * as z from "zod";
import { refineFn, refineMsg } from "./common";

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
  .refine(refineFn, refineMsg);
