import { Role, Status } from "@collabboard/shared";
import type Redis from "ioredis";

export type Member = {
  roomId: number;
  userId: number;
  membershipId: number;
  role: Role;
  status: Status;
};

const MEMBER_TTL_SEC = 7 * 24 * 60 * 60; //7d

export class MemberService {
  constructor(private r: Redis) {}

  private static keyMember = (roomId: number, userId: number) =>
    `room:${roomId}:member:${userId}`;
  private static keyStatus = (roomId: number, status: Status) =>
    `room:${roomId}:members:${status}`;

  async set({ roomId, userId, membershipId, role, status }: Member) {
    // Hash
    const keyHash = MemberService.keyMember(roomId, userId);
    const member = { membershipId: String(membershipId), role, status };

    // Set
    const keyPending = MemberService.keyStatus(roomId, Status.PENDING);
    const keyApproved = MemberService.keyStatus(roomId, Status.APPROVED);
    const keyBanned = MemberService.keyStatus(roomId, Status.BANNED);
    const keyStatus = MemberService.keyStatus(roomId, status);
    const id = String(userId);

    // Atomic set
    await this.r
      .multi()
      .hset(keyHash, member)
      .srem(keyPending, id)
      .srem(keyApproved, id)
      .srem(keyBanned, id)
      .sadd(keyStatus, id)
      .exec();
  }

  async remove(roomId: number, userId: number) {
    const keyHash = MemberService.keyMember(roomId, userId);
    const keyPending = MemberService.keyStatus(roomId, Status.PENDING);
    const keyApproved = MemberService.keyStatus(roomId, Status.APPROVED);
    const keyBanned = MemberService.keyStatus(roomId, Status.BANNED);
    const id = String(userId);

    await this.r
      .multi()
      .del(keyHash)
      .srem(keyPending, id)
      .srem(keyApproved, id)
      .srem(keyBanned, id)
      .exec();
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
    const keyPending = MemberService.keyStatus(roomId, Status.PENDING);
    const keyApproved = MemberService.keyStatus(roomId, Status.APPROVED);
    const keyBanned = MemberService.keyStatus(roomId, Status.BANNED);

    const res =
      (await this.r
        .multi()
        .smembers(keyPending)
        .smembers(keyApproved)
        .smembers(keyBanned)
        .exec()) ?? [];

    const result = new Set<number>();
    res.forEach(([err, arr]) => {
      if (!err) {
        const val = (arr as []).map(Number).filter(Number.isFinite);
        val.forEach((v) => result.add(v));
      }
    });

    return [...result];
  }

  async getIdsByStatus(roomId: number, status: Status): Promise<number[]> {
    const res = await this.r.smembers(MemberService.keyStatus(roomId, status));
    const result = new Set<number>();
    res
      .map(Number)
      .filter(Number.isFinite)
      .forEach((v) => result.add(v));
    return [...result];
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
