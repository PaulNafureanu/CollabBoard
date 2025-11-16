import { UserStateType, UserUpdate } from "@collabboard/shared";
import { AppContext } from "../../context/context";
import { Bus } from "../../realtime/bus";
import { makeMembershipRepo, makeUserRepo } from "../../repositories";
import { prisma } from "./../../db";

export async function modifyUser(userId: number, body: UserUpdate, ctx: AppContext) {
  // Update DB
  const repo = makeUserRepo(prisma);
  const user = await repo.updateUser(userId, body);

  if (body.username) {
    // Update Redis
    const { user: userSrv } = ctx.services;
    await userSrv.set({ userId: user.id, username: user.username });

    //Broadcast the update to rooms that the user is
    const memRepo = makeMembershipRepo(prisma);
    const count = await memRepo.countByUserId(user.id);
    const memberships = await memRepo.getPageByUserId(user.id, 0, count);
    const roomIds = memberships.map((m) => m.roomId);

    const payload: UserStateType = {} as UserStateType; //TODO: emit just the changed data, not the room specific data (role/status)

    Bus(ctx).toRooms(roomIds).emit("user_state", payload);
  }
}
