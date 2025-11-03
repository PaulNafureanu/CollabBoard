import type Redis from "ioredis";
import type { JsonType } from "@collabboard/shared";
import { RedisLock } from "./lock";

/**
 *  where id is boardStateId (active board state in the room)
 *
 * room:{roomId}:board:meta            HASH     {id, boardId, boardName}
 * room:{roomId}:board:state           HASH     {id, rtVersion, dbVersion}
 * room:{roomId}:board:payload         STRING   JSON_SNAPSHOT (that includes full json_payload)
 * room:{roomId}:board:stream          STREAM   {v (rtVersion), uid (userId), at (createdAt), p (json_patch)}
 */

const STREAM_MAXLEN = 1000;

export type MetaData = {
  id: number;
  boardId: number;
  boardName: string;
};

export type StateData = {
  id: number;
  rtVersion: number;
  dbVersion: number;
};

export type ActiveBoardState = {
  boardStateId: number;
  roomId: number;
  boardId: number;
  boardName: string;
  version: number;
  payload: JsonType;
};

type PatchEntry = { v: number; uid: number; at: number; p: JsonType };

export class BoardStateService {
  constructor(private r: Redis) {}

  private static keyMeta = (roomId: number) => `room:${roomId}:board:meta`;
  private static keyState = (roomId: number) => `room:${roomId}:board:state`;
  private static keyPayload = (roomId: number) =>
    `room:${roomId}:board:payload`;
  private static keyStream = (roomId: number) => `room:${roomId}:board:stream`;
  private static keyLock = (roomId: number) => `room:${roomId}:board:lock`;

  /**
   * After db persistence or after switching active board / board states,
   * there is a need to update or set a new board state.
   */
  async setActive({
    roomId,
    boardStateId,
    boardId,
    boardName,
    version,
    payload,
  }: ActiveBoardState) {
    const keyMeta = BoardStateService.keyMeta(roomId);
    const keyState = BoardStateService.keyState(roomId);
    const keyPayload = BoardStateService.keyPayload(roomId);
    const keyStream = BoardStateService.keyStream(roomId);
    const keyLock = BoardStateService.keyLock(roomId);

    const redisLocker = new RedisLock(this.r);
    const token = RedisLock.generateToken();
    const got = await redisLocker.tryAcquireWithRetry(keyLock, token);
    if (!got) throw new Error("activate_busy");

    const id = String(boardStateId);
    const rtVersion = "0";

    const metadata = {
      id,
      boardId: String(boardId),
      boardName,
    };

    const statedata = {
      id,
      rtVersion,
      dbVersion: String(version),
    };

    const snapshot = JSON.stringify(payload);
    try {
      await this.r
        .multi()
        .del(keyStream)
        .hset(keyMeta, metadata)
        .hset(keyState, statedata)
        .set(keyPayload, snapshot)
        .exec();
    } finally {
      await redisLocker.releaseLock(keyLock, token);
    }
  }

  async setMeta(roomId: number, metadata: MetaData) {
    const key = BoardStateService.keyMeta(roomId);
    await this.r.hset(key, metadata);
  }

  async setState(roomId: number, statedata: StateData) {
    const key = BoardStateService.keyState(roomId);
    await this.r.hset(key, statedata);
  }

  async setPayload(roomId: number, payload: string) {
    const key = BoardStateService.keyPayload(roomId);
    await this.r.set(key, payload);
  }

  async applyPatch() {}

  async loadMeta(roomId: number): Promise<MetaData | null> {
    const key = BoardStateService.keyMeta(roomId);
    const res = await this.r.hgetall(key);
    if (!res || Object.keys(res).length === 0) return null;

    const id = Number(res.id);
    const boardId = Number(res.boardId);
    const boardName = res.boardName;

    if (!Number.isFinite(id) || !Number.isFinite(boardId) || !boardName)
      return null;

    const metadata: MetaData = { id, boardId, boardName };
    return metadata;
  }

  async loadState(roomId: number): Promise<StateData | null> {
    const key = BoardStateService.keyState(roomId);
    const res = await this.r.hgetall(key);
    if (!res || Object.keys(res).length === 0) return null;

    const id = Number(res.id);
    const rtVersion = Number(res.rtVersion);
    const dbVersion = Number(res.dbVersion);

    if (
      !Number.isFinite(id) ||
      !Number.isFinite(rtVersion) ||
      !Number.isFinite(dbVersion)
    )
      return null;

    const statedata: StateData = { id, rtVersion, dbVersion };
    return statedata;
  }

  async loadPayload(roomId: number): Promise<JsonType | null> {
    const key = BoardStateService.keyPayload(roomId);
    const res = await this.r.get(key);
    if (!res) return null;
    return JSON.parse(res);
  }

  async streamSince(
    roomId: number,
    fromRt: number,
    limit = 500,
  ): Promise<PatchEntry[]> {
    const key = BoardStateService.keyStream(roomId);
    const entries = await this.r.xrange(key, "-", "+");
    const out: PatchEntry[] = [];

    for (const [, kv] of entries) {
      const map: Record<string, string> = {};
      for (let i = 0; i < kv.length; i += 2)
        map[kv[i] as string] = kv[i + 1] as string;

      const v = Number(map.v);
      if (!Number.isFinite(v) || v < fromRt) continue;

      const uid = Number(map.uid);
      const at = Number(map.at);
      let p: JsonType | null = null;

      try {
        if (map.p) p = JSON.parse(map.p);
      } catch {}

      if (p && Number.isFinite(uid) && Number.isFinite(at)) {
        out.push({ v, uid, at, p });
        if (out.length > limit) break;
      }
    }

    return out;
  }
}
