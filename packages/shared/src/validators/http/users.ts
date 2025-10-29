import * as z from "zod";
import Common from "./common";

const Username = Common.Name;
const Email = z.email().trim().max(255);
const Password = z.string().min(8).max(255);

const FullCreate = z
  .object({
    username: Username,
    email: Email,
    password: Password,
  })
  .strict();

const CreateBody = z.union([FullCreate, z.object({}).strict()]);

const UpdateBody = z
  .object({
    username: Username.optional(),
    email: Email.optional(),
    password: Password.optional(),
  })
  .strict()
  .refine(Common.refineFn, Common.refineMsg);

const Users = { CreateBody, UpdateBody };
export default Users;
