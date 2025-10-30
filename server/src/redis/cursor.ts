import type { CursorMoveType } from "@collabboard/shared";
import type Redis from "ioredis";

const CURSOR_TTL_SEC = 60 as const;

export class CursorService {
  constructor(private r: Redis) {}

  private static key(roomId: number, userId: number) {
    return `room:${roomId}:cursor:${userId}`;
  }

  async set({ roomId, userId, x, y, at }: CursorMoveType) {
    const key = CursorService.key(roomId, userId);
    await this.r
      .multi()
      .hset(key, { x: String(x), y: String(y), at: String(at) })
      .expire(key, CURSOR_TTL_SEC)
      .exec();
  }

  async get(roomId: number, userId: number): Promise<CursorMoveType | null> {
    const key = CursorService.key(roomId, userId);
    const value = await this.r.hgetall(key);

    if (!value || Object.keys(value).length === 0) return null;

    const x = Number(value.x);
    const y = Number(value.y);
    const at = Number(value.at);

    if (!Number.isFinite(x) || !Number.isFinite(y) || !Number.isFinite(at))
      return null;

    return {
      roomId,
      userId,
      x,
      y,
      at,
    } as CursorMoveType;
  }

  async getMany(
    roomId: number,
    userIds: number[],
  ): Promise<(CursorMoveType | null)[]> {
    if (userIds.length === 0) return [];
    const pipe = this.r.pipeline();
    const keys = userIds.map((u) => CursorService.key(roomId, u));
    keys.forEach((k) => pipe.hgetall(k));
    const results = ((await pipe.exec()) ?? []) as Array<
      [Error | null, Record<string, string>]
    >;

    return results.map(([err, value], index) => {
      if (err || !value || Object.keys(value).length === 0) return null;
      const x = Number(value.x);
      const y = Number(value.y);
      const at = Number(value.at);

      if (!Number.isFinite(x) || !Number.isFinite(y) || !Number.isFinite(at))
        return null;

      return { roomId, userId: userIds[index], x, y, at } as CursorMoveType;
    });
  }
}
