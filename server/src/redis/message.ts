import type { ChatMessageType } from "@collabboard/shared";
import type Redis from "ioredis";

const MAX_CACHE = 100 as const;
const MESSAGES_TTL_SEC = 7 * 24 * 60 * 60;

export class MessageService {
  constructor(private r: Redis) {}

  private static key(roomId: number) {
    return `room:${roomId}:messages`;
  }

  async push({ roomId, id, userId, author, text, at }: ChatMessageType) {
    const key = MessageService.key(roomId);
    const msg = JSON.stringify({ id, userId, author, text, at });

    await this.r
      .multi()
      .lpush(key, msg)
      .ltrim(key, 0, MAX_CACHE - 1)
      .expire(key, MESSAGES_TTL_SEC)
      .exec();
  }

  async recent(roomId: number, limit = 50): Promise<ChatMessageType[]> {
    const key = MessageService.key(roomId);
    const maxLimit = Math.max(0, limit - 1, MAX_CACHE - 1);
    const rawArr = await this.r.lrange(key, 0, maxLimit);
    const parsed: ChatMessageType[] = [];

    for (const rawMsg of rawArr) {
      try {
        const msg = JSON.parse(rawMsg) as ChatMessageType;
        parsed.push(msg);
      } catch (err) {}
    }

    return parsed;
  }
}
