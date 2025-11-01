import type { ChatMessageType } from "@collabboard/shared";
import type Redis from "ioredis";

const MAX_CACHE_PER_ROOM = 100 as const;
const MAX_CACHE_PER_USER = 1000 as const;

/**
 * 1. Mods+ -> delete messages
 * 2. Users -> Edit their own text messages
 * 3. Author Messages -> updates with the last username change
 *
 * room:{roomId}:messages:user:{userId} ZSET (msg ids by user)
 * room:{roomId}:messages LIST (msg ids by room)
 * room:{roomId}:message:{msgId} HASH {userId, author, text, at, deletedById, isEdited}
 */

export class MessageService {
  constructor(private r: Redis) {}

  private static keyRoom = (roomId: number) => `room:${roomId}:messages`;
  private static keyUser = (roomId: number, userId: number) =>
    `room:${roomId}:messages:user:${userId}`;
  private static keyMsg = (roomId: number, msgId: number) =>
    `room:${roomId}:message:${msgId}`;

  async setAll({
    roomId,
    id,
    userId,
    author,
    text,
    deletedById,
    isEdited,
    at,
  }: ChatMessageType) {
    const keyRoom = MessageService.keyRoom(roomId);
    const keyUser = MessageService.keyUser(roomId, userId);
    const keyMsg = MessageService.keyMsg(roomId, id);
    const msgId = String(id);
    const msg = {
      author,
      text,
      at: String(at),
      isEdited: String(isEdited),
    };

    if (userId) (msg as any).userId = String(userId);
    if (deletedById) (msg as any).deletedById = String(deletedById);

    if (await this.r.exists(keyMsg)) return; // prevents duplicates in the list

    await this.r
      .multi()
      .lpush(keyRoom, msgId)
      .ltrim(keyRoom, 0, 3 * MAX_CACHE_PER_ROOM - 1) // some dups can still occur
      .zadd(keyUser, at, msgId)
      .zremrangebyrank(keyUser, 0, -(MAX_CACHE_PER_USER + 1))
      .hset(keyMsg, msg)
      .exec();
  }

  async setMsg({
    roomId,
    id,
    userId,
    author,
    text,
    deletedById,
    isEdited,
    at,
  }: ChatMessageType) {
    const keyMsg = MessageService.keyMsg(roomId, id);
    const msgId = String(id);
    const msg = {
      author,
      text,
      at: String(at),
      isEdited: String(isEdited),
    };

    if (userId) (msg as any).userId = String(userId);
    if (deletedById) (msg as any).deletedById = String(deletedById);

    await this.r.hset(keyMsg, msg);
  }

  async recentMsgIdsByRoom(roomId: number): Promise<number[]> {
    return [];
  }
  async recentMsgIdsByUser(roomId: number, userId: number): Promise<number[]> {
    return [];
  }
  async getMsg(roomId: number, msgId: number): Promise<ChatMessageType | null> {
    return null;
  }
  async getMsgByIds(
    roomId: number,
    msgIds: number[],
  ): Promise<ChatMessageType[]> {
    return [];
  }
}

// private static key(roomId: number) {
//   return `room:${roomId}:messages`;
// }

// async push({ roomId, id, userId, author, text, at }: ChatMessageType) {
//   const key = MessageService.key(roomId);
//   const msg = JSON.stringify({ id, userId, author, text, at });

//   await this.r
//     .multi()
//     .lpush(key, msg)
//     .ltrim(key, 0, MAX_CACHE - 1)
//     .expire(key, MESSAGES_TTL_SEC)
//     .exec();
// }

// async recent(roomId: number, limit = 50): Promise<ChatMessageType[]> {
//   const key = MessageService.key(roomId);
//   const end = Math.min(limit - 1, MAX_CACHE - 1);
//   const rawArr = await this.r.lrange(key, 0, Math.max(0, end));
//   const parsed: ChatMessageType[] = [];

//   for (const rawMsg of rawArr) {
//     try {
//       const msg = JSON.parse(rawMsg) as ChatMessageType;
//       parsed.push(msg);
//     } catch (err) {}
//   }

//   return parsed;
// }
