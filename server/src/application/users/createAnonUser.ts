import { UserPublic } from "@collabboard/shared";
import { prisma } from "../../db";
import { makeUserRepo } from "../../repositories";

export async function createAnonUser(): Promise<UserPublic> {
  return await prisma.$transaction(async (tx) => {
    const repo = makeUserRepo(tx);
    const base = await repo.createEmptyUser();
    return await repo.setFieldsToEmptyUser(base.id);
  });
}
