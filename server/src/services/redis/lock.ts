import type Redis from "ioredis";
import { randomUUID } from "node:crypto";

const ACTIVATE_LOCK_TTL_SEC = 5;

export class RedisLock {
  static generateToken() {
    return randomUUID();
  }

  constructor(private r: Redis) {
    if (typeof (this.r as any).releaseRedisLock !== "function") {
      this.r.defineCommand("releaseRedisLock", {
        numberOfKeys: 1,
        lua: `
            if redis.call("GET", KEYS[1]) == ARGV[1]
            then return redis.call("DEL", KEYS[1]) else return 0 end
            `,
      });
    }
  }

  async acquireLock(key: string, token: string): Promise<boolean> {
    const ok = await this.r.set(key, token, "EX", ACTIVATE_LOCK_TTL_SEC, "NX");
    return ok === "OK";
  }

  async releaseLock(key: string, token: string): Promise<boolean> {
    const n = await (this.r as any).releaseRedisLock(key, token);
    return n === 1;
  }

  async tryAcquireWithRetry(key: string, token: string, ms = 1000): Promise<boolean> {
    if (ms <= 0) return this.acquireLock(key, token);
    const start = Date.now();
    while (Date.now() - start < ms) {
      try {
        if (await this.acquireLock(key, token)) return true;
      } catch {}
      await new Promise((r) => setTimeout(r, 25 + Math.random() * 50));
    }
    return false;
  }
}
