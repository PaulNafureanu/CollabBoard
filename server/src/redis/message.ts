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

  private static parseMsg = (
    roomId: number,
    msgId: number,
    res: Record<string, string>,
  ): ChatMessageType | null => {
    if (!res || Object.keys(res).length === 0) return null;

    const author = res.author?.trim();
    const text = res.text?.trim();
    const at = Number(res.at);
    const isEdited = Number(res.isEdited);
    const userId = res.userId ? Number(res.userId) : undefined;
    const deletedById = res.deletedById ? Number(res.deletedById) : undefined;

    const isAtValid = Number.isFinite(at);
    const isFlagValid = Number.isFinite(isEdited);

    if (!author || !text || !isAtValid || !isFlagValid) return null;
    if (res.userId && !Number.isFinite(userId)) return null;
    if (res.deletedById && !Number.isFinite(deletedById)) return null;

    const msg: ChatMessageType = {
      id: msgId,
      author,
      text,
      at,
      isEdited: Boolean(isEdited),
      userId,
      roomId,
      deletedById,
    };

    return msg;
  };

  private static parseStrIds = (res: string[], limit: number, max: number) => {
    const unique = [...new Set(res)];
    const count = Math.max(0, Math.min(limit, max));
    return unique.map(Number).filter(Number.isFinite).slice(0, count);
  };

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
    if (!userId) return;
    const keyRoom = MessageService.keyRoom(roomId);
    const keyUser = MessageService.keyUser(roomId, userId);
    const keyMsg = MessageService.keyMsg(roomId, id);
    const msgId = String(id);
    const msg = {
      author,
      text,
      at: String(at),
      isEdited: isEdited ? "1" : "0",
    };

    if (userId) (msg as any).userId = String(userId);
    if (deletedById) (msg as any).deletedById = String(deletedById);

    if (await this.r.exists(keyMsg)) return; // prevents some duplicates in the list

    await this.r
      .multi()
      .lpush(keyRoom, msgId)
      .ltrim(keyRoom, 0, 3 * MAX_CACHE_PER_ROOM - 1) // dups can still occur
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
    const msg = {
      author,
      text,
      at: String(at),
      isEdited: isEdited ? "1" : "0",
    };

    if (userId) (msg as any).userId = String(userId);
    if (deletedById) (msg as any).deletedById = String(deletedById);

    await this.r.hset(keyMsg, msg);
  }

  async recentMsgIdsByRoom(roomId: number, limit: number): Promise<number[]> {
    const keyRoom = MessageService.keyRoom(roomId);
    if (limit <= 0) return [];
    const res = await this.r.lrange(keyRoom, 0, 3 * MAX_CACHE_PER_ROOM - 1);
    return MessageService.parseStrIds(res, limit, MAX_CACHE_PER_ROOM);
  }

  async recentMsgIdsByUser(roomId: number, userId: number): Promise<number[]> {
    const keyUser = MessageService.keyUser(roomId, userId);
    const res = await this.r.zrange(keyUser, 0, MAX_CACHE_PER_USER - 1, "REV");
    const max = MAX_CACHE_PER_USER;
    return MessageService.parseStrIds(res, max, max);
  }

  async getMsg(roomId: number, msgId: number): Promise<ChatMessageType | null> {
    const key = MessageService.keyMsg(roomId, msgId);
    const res = await this.r.hgetall(key);
    return MessageService.parseMsg(roomId, msgId, res);
  }

  async getMsgByIds(
    roomId: number,
    msgIds: number[],
  ): Promise<ChatMessageType[]> {
    if (msgIds.length === 0) return [];
    const pipe = this.r.pipeline();
    msgIds.forEach((id) => pipe.hgetall(MessageService.keyMsg(roomId, id)));
    const res = (await pipe.exec()) ?? [];

    return res
      .map(([err, value], index) => {
        const id = msgIds[index];
        if (err || !id) return null;
        return MessageService.parseMsg(
          roomId,
          id,
          value as Record<string, string>,
        );
      })
      .filter((v) => v !== null);
  }
}
