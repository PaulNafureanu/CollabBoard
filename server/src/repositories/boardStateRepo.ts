import { CreateBoardStateBody } from "@collabboard/shared";
import { PublicBoardState, PublicBoardStateType } from "./schemas/boardStateSchemas";
import { parseMany } from "./shared/parser";
import { buildDBPageQuery, OrderByKey } from "./shared/page";
import { boardStatePublicSelect, TxClient } from "../db";
import { DefaultBoardStatePayload, toBoardStatePublic } from "../domain";

export const makeBoardStateRepo = (db: TxClient) => {
  const count = async (boardId: number): Promise<number> => {
    return await db.boardState.count({ where: { boardId } });
  };

  const findById = async (boardStateId: number): Promise<PublicBoardStateType | null> => {
    const row = await db.boardState.findUnique({ where: { id: boardStateId }, select: boardStatePublicSelect });
    if (!row) return null;
    const dto = toBoardStatePublic(row);
    return PublicBoardState.parse(dto);
  };

  const getPageByBoardId = async (boardId: number, page: number, size: number): Promise<PublicBoardStateType[]> => {
    const rows = await db.boardState.findMany(
      buildDBPageQuery({ boardId }, OrderByKey.version, page, size, boardStatePublicSelect),
    );
    if (rows.length === 0) return [];
    return parseMany(rows, toBoardStatePublic, PublicBoardState);
  };

  const findManyByBoardId = async (boardId: number): Promise<PublicBoardStateType[]> => {
    const rows = await db.boardState.findMany({ where: { boardId }, select: boardStatePublicSelect });
    if (rows.length === 0) return [];
    return parseMany(rows, toBoardStatePublic, PublicBoardState);
  };

  const findLastBoardState = async (boardId: number): Promise<PublicBoardStateType | null> => {
    const row = await db.boardState.findFirst({
      where: { boardId },
      orderBy: [{ version: "desc" }, { id: "desc" }],
      select: boardStatePublicSelect,
    });
    if (!row) return null;
    const dto = toBoardStatePublic(row);
    return PublicBoardState.parse(dto);
  };

  const createEmptyBoardStateForNewBoards = async (boardId: number): Promise<PublicBoardStateType> => {
    const row = await db.boardState.create({ data: { boardId, payload: DefaultBoardStatePayload, version: 1 } });
    const dto = toBoardStatePublic(row);
    return PublicBoardState.parse(dto);
  };

  const createBoardState = async (body: CreateBoardStateBody): Promise<PublicBoardStateType> => {
    const data = { ...body, payload: body.payload ?? DefaultBoardStatePayload };
    const row = await db.boardState.create({ data });
    const dto = toBoardStatePublic(row);
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
    count,
    getPageByBoardId,
    findManyByBoardId,
    findLastBoardState,
    createEmptyBoardStateForNewBoards,
    createBoardState,
    createMany,
    deleteManyBoardStatesGTE,
  };
};
