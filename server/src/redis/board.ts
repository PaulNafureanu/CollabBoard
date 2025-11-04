import type Redis from "ioredis";
import {
  applyPatchToPayload,
  type BoardPatchType,
  type JsonType,
} from "@collabboard/shared";
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
const PATCH_ATTEMPTS = 3;

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

export type PatchEntry = { v: number; uid: number; at: number; p: JsonType };
export enum PATCH_CONFLICT_REASONS {
  UNDEFINED_STATE = "UNDEFINED_STATE",
  UNDEFINED_SERVER_RT = "UNDEFINED_SERVER_RT",
  VERSION_CONFLICT = "VERSION_CONFLICT",
  UNDEFINED_PAYLOAD = "UNDEFINED_PAYLOAD",
  PATCH_FN_CONFLICT = "PATCH_FN_CONFLICT",
  PATCH_RETRY_FAILED = "PATCH_RETRY_FAILED",
}

export class BoardStateService {
  constructor(
    private r: Redis,
    private locker: RedisLock,
  ) {}

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

    const token = RedisLock.generateToken();
    const got = await this.locker.tryAcquireWithRetry(keyLock, token);
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
      await this.locker.releaseLock(keyLock, token);
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

  async setPayload(roomId: number, payload: JsonType) {
    const key = BoardStateService.keyPayload(roomId);
    await this.r.set(key, JSON.stringify(payload));
  }

  async applyPatch({
    roomId,
    userId,
    rtVersion,
    patch,
    at,
  }: BoardPatchType): Promise<
    | { ok: true; newRt: number }
    | { ok: false; reason: PATCH_CONFLICT_REASONS; serverRt: number }
  > {
    const keyState = BoardStateService.keyState(roomId);
    const keyPayload = BoardStateService.keyPayload(roomId);
    const keyStream = BoardStateService.keyStream(roomId);

    for (let i = 0; i < PATCH_ATTEMPTS; i++) {
      await this.r.watch(keyState, keyPayload);
      const state = await this.r.hgetall(keyState);
      if (!state || !state.rtVersion) {
        await this.r.unwatch();
        return {
          ok: false,
          reason: PATCH_CONFLICT_REASONS.UNDEFINED_STATE,
          serverRt: NaN,
        };
      }

      const serverRt = Number(state.rtVersion);

      if (!Number.isFinite(serverRt)) {
        await this.r.unwatch();
        return {
          ok: false,
          reason: PATCH_CONFLICT_REASONS.UNDEFINED_SERVER_RT,
          serverRt: NaN,
        };
      }

      if (rtVersion !== serverRt) {
        await this.r.unwatch();
        return {
          ok: false,
          reason: PATCH_CONFLICT_REASONS.VERSION_CONFLICT,
          serverRt,
        };
      }

      const raw = await this.r.get(keyPayload);
      if (!raw) {
        await this.r.unwatch();
        return {
          ok: false,
          reason: PATCH_CONFLICT_REASONS.UNDEFINED_PAYLOAD,
          serverRt,
        };
      }

      let nextPayload: JsonType;

      try {
        const current = JSON.parse(raw) as JsonType;
        nextPayload = applyPatchToPayload(current, patch);
      } catch {
        await this.r.unwatch();
        return {
          ok: false,
          reason: PATCH_CONFLICT_REASONS.PATCH_FN_CONFLICT,
          serverRt,
        };
      }

      const newRt = serverRt + 1;
      const multi = this.r.multi();
      multi.set(keyPayload, JSON.stringify(nextPayload));
      multi.hincrby(keyState, "rtVersion", 1);
      multi.xadd(
        keyStream,
        "MAXLEN",
        "~",
        String(STREAM_MAXLEN),
        "*",
        "v",
        String(newRt),
        "uid",
        String(userId),
        "at",
        String(at),
        "p",
        JSON.stringify(patch),
      );

      const res = await multi.exec();
      if (res) return { ok: true, newRt };
    }

    const latest = await this.r.hget(keyState, "rtVersion");
    return {
      ok: false,
      reason: PATCH_CONFLICT_REASONS.PATCH_RETRY_FAILED,
      serverRt: Number(latest ?? NaN),
    };
  }

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
