import type Redis from "ioredis";
/**
 * user:{userId}    HASH {username}
 */

export type UserData = {
  userId: number;
  username: string;
};

export class UserService {
  constructor(private r: Redis) {}

  private static keyUser = (userId: number) => `user:${userId}`;

  async set({ userId, username }: UserData) {
    await this.r.hset(UserService.keyUser(userId), { username });
  }

  async get(userId: number): Promise<UserData | null> {
    const key = UserService.keyUser(userId);
    const value = await this.r.hgetall(key);

    if (!value || Object.keys(value).length === 0) return null;

    const username = value.username;
    if (username === undefined) return null;

    return { userId, username };
  }
}
