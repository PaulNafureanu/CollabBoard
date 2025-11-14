import type { PublicUserType } from "../../repositories/schemas/userSchemas";
import { makeUserRepo } from "../../repositories/userRepo";
import { prisma } from "./../../db/prisma";

export async function createAnonUser(): Promise<PublicUserType> {
  return await prisma.$transaction(async (tx) => {
    const repo = makeUserRepo(tx);
    const base = await repo.createEmptyUser();
    return await repo.setFieldsToEmptyUser(base.id);
  });
}
