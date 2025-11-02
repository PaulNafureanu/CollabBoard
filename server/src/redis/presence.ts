import type Redis from "ioredis";

export class PresenceService {
  constructor(private r: Redis) {}

  private static keyOnline = (roomId: number) => `room:${roomId}:online`;
  private static keyConns = (roomId: number, userId: number) =>
    `room:${roomId}:conns:${userId}`;

  async addUserConnection(roomId: number, userId: number, socketId: string) {
    const keyConns = PresenceService.keyConns(roomId, userId);
    const keyOnline = PresenceService.keyOnline(roomId);
    const usrId = String(userId);
    await this.r.multi().sadd(keyConns, socketId).sadd(keyOnline, usrId).exec();
  }

  async removeUserConnection(
    roomId: number,
    userId: number,
    socketId: string,
  ): Promise<number> {
    const keyConns = PresenceService.keyConns(roomId, userId);
    const keyOnline = PresenceService.keyOnline(roomId);
    const usrId = String(userId);

    const luaScript = `
    redis.call("SREM", KEYS[1], ARGV[1])
    local count = redis.call("SCARD", KEYS[1])
    if count == 0 then
        redis.call("SREM", KEYS[2], ARGV[2])
    end
    return count
    `;

    return (await this.r.eval(
      luaScript,
      2,
      keyConns,
      keyOnline,
      socketId,
      usrId,
    )) as number;
  }

  async getUserConnectionCounter(
    roomId: number,
    userId: number,
  ): Promise<number> {
    const keyConns = PresenceService.keyConns(roomId, userId);
    return await this.r.scard(keyConns);
  }

  async listUserConnections(roomId: number, userId: number): Promise<string[]> {
    const keyConns = PresenceService.keyConns(roomId, userId);
    const res = await this.r.smembers(keyConns);
    return res.filter((id) => id);
  }

  async isUserOnline(roomId: number, userId: number): Promise<boolean> {
    const key = PresenceService.keyOnline(roomId);
    const id = String(userId);

    const exists = await this.r.sismember(key, id);
    return Boolean(exists);
  }

  async areUsersOnline(roomId: number, userIds: number[]): Promise<boolean[]> {
    const key = PresenceService.keyOnline(roomId);
    if (userIds.length === 0) return [];

    const pipe = this.r.pipeline();

    userIds.forEach((id) => pipe.sismember(key, id));
    const res = (await pipe.exec()) ?? [];

    const results: boolean[] = res.map(([err, val]) => {
      if (err) return false;
      return Boolean(val);
    });

    return results;
  }

  async listOnlineUsers(roomId: number): Promise<number[]> {
    const key = PresenceService.keyOnline(roomId);
    const res = await this.r.smembers(key);
    return res.map(Number).filter(Number.isFinite);
  }
}
