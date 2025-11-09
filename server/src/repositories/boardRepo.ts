import { PublicBoard, PublicBoardType } from "./schemas/boardSchemas";
import { mapBoardRowToPublic, publicBoardSelect } from "./shapes/boardShape";
import { buildDBPageQuery, OrderByKey } from "./shared/page";
import { parseMany } from "./shared/parser";
import { TxClient } from "./types/tx";

export const makeBoardRepo = (db: TxClient) => {
  const count = async (roomId: number): Promise<number> => {
    return await db.board.count({ where: { roomId } });
  };

  const findById = async (boardId: number): Promise<PublicBoardType | null> => {
    const row = await db.board.findUnique({ where: { id: boardId }, select: publicBoardSelect });
    if (!row) return null;
    const dto = mapBoardRowToPublic(row);
    return PublicBoard.parse(dto);
  };

  const getPageByRoomId = async (roomId: number, page: number, size: number): Promise<PublicBoardType[]> => {
    const rows = await db.board.findMany(
      buildDBPageQuery({ roomId }, OrderByKey.updatedAt, page, size, publicBoardSelect),
    );
    if (rows.length === 0) return [];
    return parseMany(rows, mapBoardRowToPublic, PublicBoard);
  };

  const createEmptyBoard = async (roomId: number, name?: string) => {
    const row = await db.board.create({ data: { roomId, name: name ?? "" }, select: publicBoardSelect });
    if (!row) return null;
    const dto = mapBoardRowToPublic(row);
    return PublicBoard.parse(dto);
  };

  const updateBoard = async (boardId: number, roomId: number, lastState?: number, name?: string) => {
    const data: any = {};

    data.roomId = roomId;
    if (lastState !== undefined) data.lastState = lastState;
    if (name !== undefined) data.name = name;

    const row = await db.board.update({ where: { id: boardId }, data, select: publicBoardSelect });
    if (!row) return null;
    const dto = mapBoardRowToPublic(row);
    return PublicBoard.parse(dto);
  };

  const deleteBoard = async (boardId: number) => {
    await db.board.delete({ where: { id: boardId } });
  };

  return { count, getPageByRoomId, findById, createEmptyBoard, updateBoard, deleteBoard };
};
