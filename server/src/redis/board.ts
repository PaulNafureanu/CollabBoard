import type Redis from "ioredis";
import type { JsonType } from "@collabboard/shared";

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
  id: string;
  boardId: string;
  boardName: string;
};

export type StateData = {
  id: string;
  rtVersion: string;
  dbVersion: string;
};

export type ActiveBoardState = {
  boardStateId: number;
  roomId: number;
  boardId: number;
  boardName: string;
  version: number;
  payload: JsonType;
};

export class BoardStateService {
  constructor(private r: Redis) {}

  private static keyMeta = (roomId: number) => `room:${roomId}:board:meta`;
  private static keyState = (roomId: number) => `room:${roomId}:board:state`;
  private static keyPayload = (roomId: number) =>
    `room:${roomId}:board:payload`;
  private static keyStream = (roomId: number) => `room:${roomId}:board:stream`;

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

    const id = String(boardStateId);
    const rtVersion = "0";

    const metadata: MetaData = {
      id,
      boardId: String(boardId),
      boardName,
    };

    const statedata: StateData = {
      id,
      rtVersion,
      dbVersion: String(version),
    };

    const snapshot = JSON.stringify(payload);

    await this.r
      .multi()
      .del(keyStream)
      .hset(keyMeta, metadata)
      .hset(keyState, statedata)
      .set(keyPayload, snapshot)
      .exec();
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

    const id = res.id;
    const boardId = res.boardId;
    const boardName = res.boardName;

    if (!id || !boardId || !boardName) return null;
    const metadata: MetaData = { id, boardId, boardName };
    return metadata;
  }

  async loadState(roomId: number): Promise<StateData | null> {
    const key = BoardStateService.keyState(roomId);
    const res = await this.r.hgetall(key);
    if (!res || Object.keys(res).length === 0) return null;

    const id = res.id;
    const rtVersion = res.rtVersion;
    const dbVersion = res.dbVersion;

    if (!id || !rtVersion || !dbVersion) return null;
    const statedata: StateData = { id, rtVersion, dbVersion };
    return statedata;
  }

  async loadPayload(roomId: number) {
    const key = BoardStateService.keyPayload(roomId);
    return await this.r.get(key);
  }

  async streamSince() {}
}
