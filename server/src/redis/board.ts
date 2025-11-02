import type Redis from "ioredis";

/**
 *  where id is boardStateId
 *
 * room:{roomId}:board:meta            HASH     {id, boardId, boardName}
 * room:{roomId}:board:state           HASH     {id, rtVersion, dbVersion}
 * room:{roomId}:board:payload         STRING   JSON_SNAPSHOT (that includes full json_payload, id, rtVersion)
 * room:{roomId}:board:stream          STREAM   {v (rtVersion), uid (userId), at (createdAt), p (json_patch)}
 */

/**
 * 
const BoardState = z.object({
  id: Id,
  boardId: Id,
  boardName: Name,
  dbVersion: PosNumber.int(), // database version (increments after db persistence)
  rtVersion: PosNumber.int(), // realtime version (increments after each successful board patch)
  payload: JsonSchema,
});

export const BoardPatch = z
  .object({
    roomId: Id,
    boardStateId: Id,
    rtVersion: PosNumber.int(), //realtime version
    //TODO: fix this when you know the shape of the json payload
    patch: z.object({
      path: JsonPathSchema,
      value: JsonSchema,
    }),

    at: MsEpoch,
  })
  .strict();
 */

export class BoardStateService {
  constructor(private r: Redis) {}
}
