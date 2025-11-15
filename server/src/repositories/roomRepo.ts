import type { UpdateRoomBody } from "@collabboard/shared";
import { PublicRoom, type PublicRoomType } from "./schemas/roomSchemas";
import { roomPublicSelect, TxClient } from "../db";
import { toRoomPublic } from "../domain";

export type RoomRepo = ReturnType<typeof makeRoomRepo>;

export const makeRoomRepo = (db: TxClient) => {
  const findById = async (roomId: number): Promise<PublicRoomType | null> => {
    const row = await db.room.findUnique({ where: { id: roomId }, select: roomPublicSelect });
    if (!row) return null;
    const dto = toRoomPublic(row);
    return PublicRoom.parse(dto);
  };

  const createEmptyRoom = async (name?: string): Promise<PublicRoomType> => {
    const row = await db.room.create({ data: { name: name ?? "" }, select: roomPublicSelect });
    const dto = toRoomPublic(row);
    return PublicRoom.parse(dto);
  };

  const updateRoom = async (roomId: number, body: UpdateRoomBody): Promise<PublicRoomType> => {
    const { name, activeBoardStateId } = body;
    const data: any = {};

    if (name !== undefined) data.name = name;
    if (activeBoardStateId !== undefined) data.activeBoardStateId = activeBoardStateId;

    const row = await db.room.update({ where: { id: roomId }, data, select: roomPublicSelect });
    const dto = toRoomPublic(row);
    return PublicRoom.parse(dto);
  };

  const deleteRoom = async (roomId: number) => {
    await db.room.delete({ where: { id: roomId } });
  };

  return { findById, createEmptyRoom, updateRoom, deleteRoom };
};
