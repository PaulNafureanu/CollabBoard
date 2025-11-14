import { UpdateUserBody } from "@collabboard/shared";
import { AppContext } from "../../context/context";
import { makeUserRepo } from "../../repositories/userRepo";
import { prisma } from "./../../db/prisma";
import { Bus } from "../../realtime/bus";
import { makeMembershipRepo } from "../../repositories/membershipRepo";

export async function modifyUser(userId: number, body: UpdateUserBody, ctx: AppContext) {
  // Update DB
  const repo = makeUserRepo(prisma);
  const user = await repo.updateUser(userId, body);

  if (body.username) {
    // Update Redis
    const { user: userSrv } = ctx.services;
    await userSrv.set({ userId: user.id, username: user.username });

    //TODO:

    const memRepo = makeMembershipRepo(prisma);

    memRepo.getPageByUserId(user.id, 0, 50);

    //Broadcast the update to rooms that the user is

    Bus(ctx).toRooms([]);
  }
}
