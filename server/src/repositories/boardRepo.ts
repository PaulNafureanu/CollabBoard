import { BoardPublic, BoardPublicSchema } from "@collabboard/shared";
import { boardPublicSelect, TxClient } from "../db";
import { toBoardPublic } from "../domain";
import { buildDBPageQuery, OrderByKey } from "./shared/page";
import { parseMany } from "./shared/parser";

export const makeBoardRepo = (db: TxClient) => {
  const count = async (roomId: number): Promise<number> => {
    return await db.board.count({ where: { roomId } });
  };

  const findById = async (boardId: number): Promise<BoardPublic | null> => {
    const row = await db.board.findUnique({ where: { id: boardId }, select: boardPublicSelect });
    if (!row) return null;
    const dto = toBoardPublic(row);
    return BoardPublicSchema.parse(dto);
  };

  const getPageByRoomId = async (roomId: number, page: number, size: number): Promise<BoardPublic[]> => {
    const rows = await db.board.findMany(
      buildDBPageQuery({ roomId }, OrderByKey.updatedAt, page, size, boardPublicSelect),
    );
    if (rows.length === 0) return [];
    return parseMany(rows, toBoardPublic, BoardPublicSchema);
  };

  const createEmptyBoard = async (roomId: number, name?: string): Promise<BoardPublic | null> => {
    const row = await db.board.create({ data: { roomId, name: name ?? "" }, select: boardPublicSelect });
    if (!row) return null;
    const dto = toBoardPublic(row);
    return BoardPublicSchema.parse(dto);
  };

  const updateBoard = async (
    boardId: number,
    roomId: number,
    lastState?: number,
    name?: string,
  ): Promise<BoardPublic | null> => {
    const data: any = {};

    data.roomId = roomId;
    if (lastState !== undefined) data.lastState = lastState;
    if (name !== undefined) data.name = name;

    const row = await db.board.update({ where: { id: boardId }, data, select: boardPublicSelect });
    if (!row) return null;
    const dto = toBoardPublic(row);
    return BoardPublicSchema.parse(dto);
  };

  const deleteBoard = async (boardId: number) => {
    await db.board.delete({ where: { id: boardId } });
  };

  return { count, getPageByRoomId, findById, createEmptyBoard, updateBoard, deleteBoard };
};
