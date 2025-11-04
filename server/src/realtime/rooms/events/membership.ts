import {
  JoinRequestType,
  PublicMembership,
  Role,
  Status,
} from "@collabboard/shared";
import { SocketType } from "../../types";
import { MemberService } from "../../../redis/member";
import Redis from "ioredis";
import { PresenceService } from "../../../redis/presence";

// POST /membership with pending => server emits join_request to Admin / Mods
export async function emitJoinRequest(
  socket: SocketType,
  redis: Redis,
  dbMembership: PublicMembership,
) {
  const { roomId } = dbMembership;
  const memberSrv = new MemberService(redis);
  const presenceSrv = new PresenceService(redis);

  const mods = await memberSrv.getIdsByRole(roomId, [
    Role.OWNER,
    Role.MODERATOR,
  ]);
  const onlineUsers = await presenceSrv.listOnlineUsers(roomId);

  //   const online = await

  //   const { roomId } = dbMembership;
  //   const srv = new MemberService(redis);
  //   const approvedUserIds = await srv.getIdsByStatus(roomId, Status.APPROVED);
  //   const roomMmebers = await srv.getMembersByIds(roomId, approvedUserIds);
  //   const modMembers = roomMmebers.filter(
  //     ({ role }) => role === Role.MODERATOR || role === Role.OWNER,
  //   );
  //   const payload: JoinRequestType = {} as JoinRequestType;
  //   socket.to([]).emit("join_request", payload);
}

export function emitJoinPending() {}
