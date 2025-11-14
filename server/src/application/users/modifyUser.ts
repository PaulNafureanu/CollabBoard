import { UpdateUserBody } from "@collabboard/shared";
import { AppContext } from "../../context/context";
import { makeUserRepo } from "../../repositories/userRepo";
import { prisma } from "./../../db/prisma";

export async function modifyUser(userId: number, body: UpdateUserBody, ctx: AppContext) {
  // Update DB
  const repo = makeUserRepo(prisma);
  const user = await repo.updateUser(userId, body);

  // Update Redis

  if (body.username !== undefined) {
  }
}
