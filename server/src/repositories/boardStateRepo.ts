import { CreateBoardStateBody } from "@collabboard/shared";
import { PublicBoardState, PublicBoardStateType } from "./schemas/boardStateSchemas";
import { DefaultBoardStatePayload, mapBoardStateRowToPublic, publicBoardStateSelect } from "./shapes/boardStateShape";
import { parseMany } from "./shared/parser";
import { TxClient } from "./types/tx";

export const makeBoardStateRepo = (db: TxClient) => {
  const findById = async (boardStateId: number): Promise<PublicBoardStateType | null> => {
    const row = await db.boardState.findUnique({ where: { id: boardStateId }, select: publicBoardStateSelect });
    if (!row) return null;
    const dto = mapBoardStateRowToPublic(row);
    return PublicBoardState.parse(dto);
  };

  const findManyByBoardId = async (boardId: number): Promise<PublicBoardStateType[]> => {
    const rows = await db.boardState.findMany({ where: { boardId }, select: publicBoardStateSelect });
    if (rows.length === 0) return [];
    return parseMany(rows, mapBoardStateRowToPublic, PublicBoardState);
  };

  const findLastBoardState = async (boardId: number): Promise<PublicBoardStateType | null> => {
    const row = await db.boardState.findFirst({
      where: { boardId },
      orderBy: [{ version: "desc" }, { id: "desc" }],
      select: publicBoardStateSelect,
    });
    if (!row) return null;
    const dto = mapBoardStateRowToPublic(row);
    return PublicBoardState.parse(dto);
  };

  const createEmptyBoardStateForNewBoards = async (boardId: number): Promise<PublicBoardStateType> => {
    const row = await db.boardState.create({ data: { boardId, payload: DefaultBoardStatePayload, version: 1 } });
    const dto = mapBoardStateRowToPublic(row);
    return PublicBoardState.parse(dto);
  };

  const createBoardState = async (body: CreateBoardStateBody): Promise<PublicBoardStateType> => {
    const data = { ...body, payload: body.payload ?? DefaultBoardStatePayload };
    const row = await db.boardState.create({ data });
    const dto = mapBoardStateRowToPublic(row);
    return PublicBoardState.parse(dto);
  };

  const createMany = async (boardId: number, states: PublicBoardStateType[]) => {
    await db.boardState.createMany({
      data: states.map((state) => {
        return { boardId, payload: state.payload ?? DefaultBoardStatePayload, version: state.version };
      }),
    });
  };

  const deleteManyBoardStatesGTE = async (boardId: number, fromVersion: number) => {
    await db.boardState.deleteMany({ where: { boardId, version: { gte: fromVersion } } });
  };

  return {
    findById,
    findManyByBoardId,
    findLastBoardState,
    createEmptyBoardStateForNewBoards,
    createBoardState,
    createMany,
    deleteManyBoardStatesGTE,
  };
};
