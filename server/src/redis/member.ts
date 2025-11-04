import { Role, Status } from "@collabboard/shared";
import type Redis from "ioredis";

export type Member = {
  roomId: number;
  userId: number;
  membershipId: number;
  role: Role;
  status: Status;
};

const ALL_STATUSES: Status[] = Object.values(Status);
const ALL_ROLES: Role[] = Object.values(Role);

export class MemberService {
  constructor(private r: Redis) {}

  static keyMember = (roomId: number, userId: number) =>
    `room:${roomId}:member:${userId}`;
  static keyStatus = (roomId: number, status: Status) =>
    `room:${roomId}:members:${status}`;
  static keyRole = (roomId: number, role: Role) =>
    `room:${roomId}:members:${role}`;

  async set({ roomId, userId, membershipId, role, status }: Member) {
    // Hash
    const keyHash = MemberService.keyMember(roomId, userId);
    const member = { membershipId: String(membershipId), role, status };

    // Set
    const keyStatus = MemberService.keyStatus(roomId, status);
    const keyRole = MemberService.keyRole(roomId, role);
    const id = String(userId);

    const multi = this.r.multi().hset(keyHash, member);
    for (const s of ALL_STATUSES)
      multi.srem(MemberService.keyStatus(roomId, s), id);
    multi.sadd(keyStatus, id);

    for (const r of ALL_ROLES) multi.srem(MemberService.keyRole(roomId, r), id);
    multi.sadd(keyRole, id);
    await multi.exec();
  }

  async remove(roomId: number, userId: number) {
    const keyHash = MemberService.keyMember(roomId, userId);
    const id = String(userId);

    const multi = this.r.multi().del(keyHash);
    for (const status of ALL_STATUSES)
      multi.srem(MemberService.keyStatus(roomId, status), id);
    for (const role of ALL_ROLES)
      multi.srem(MemberService.keyRole(roomId, role), id);
    await multi.exec();
  }

  async getMember(roomId: number, userId: number): Promise<Member | null> {
    const keyHash = MemberService.keyMember(roomId, userId);
    const res = await this.r.hgetall(keyHash);

    if (!res || Object.keys(res).length === 0) return null;

    const membershipId = Number(res.membershipId);
    const role = res.role as Role | undefined;
    const status = res.status as Status | undefined;

    if (!Number.isFinite(membershipId) || !role || !status) return null;

    return {
      roomId,
      userId,
      membershipId,
      role,
      status,
    } as Member;
  }

  async getRoomIds(roomId: number): Promise<number[]> {
    const keys = ALL_STATUSES.map((status) =>
      MemberService.keyStatus(roomId, status),
    );
    const res = await this.r.sunion(...keys);
    return res.map(Number).filter(Number.isFinite);
  }

  async getIdsByStatus(roomId: number, statuses: Status[]): Promise<number[]> {
    const keys = statuses.map((status) =>
      MemberService.keyStatus(roomId, status),
    );
    const res = await this.r.sunion(...keys);
    return res.map(Number).filter(Number.isFinite);
  }

  async getIdsByRole(roomId: number, roles: Role[]): Promise<number[]> {
    const keys = roles.map((role) => MemberService.keyRole(roomId, role));
    const res = await this.r.sunion(...keys);
    return res.map(Number).filter(Number.isFinite);
  }

  async getMembersByIds(roomId: number, ids: number[]): Promise<Member[]> {
    if (ids.length === 0) return [];
    const pipe = this.r.pipeline();

    ids.forEach((id) => pipe.hgetall(MemberService.keyMember(roomId, id)));
    const tuples = (await pipe.exec()) ?? [];

    const results: Member[] = [];

    tuples.forEach(([err, value], index) => {
      if (!err && value && Object.keys(value).length > 0) {
        const membershipId = Number((value as any).membershipId);
        const role = (value as any).role as Role | undefined;
        const status = (value as any).status as Status | undefined;
        const userId = ids[index];

        if (Number.isFinite(membershipId) && role && status && userId)
          results.push({ roomId, userId, membershipId, role, status });
      }
    });

    return results;
  }
}
