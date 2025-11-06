import type { CreateRoomBody, UpdateRoomBody } from "@collabboard/shared";
import { PublicRoom, type PublicRoomType } from "./schemas/roomSchemas";
import { mapRoomRowToPublic, publicRoomSelect } from "./shapes/roomShape";
import type { TxClient } from "./types/tx";

export const makeRoomRepo = (db: TxClient) => {
  const findById = async (roomId: number): Promise<PublicRoomType | null> => {
    const row = await db.room.findUnique({ where: { id: roomId }, select: publicRoomSelect });
    if (!row) return null;
    const dto = mapRoomRowToPublic(row);
    return PublicRoom.parse(dto);
  };

  const createRoom = async (body: CreateRoomBody): Promise<PublicRoomType> => {};

  const updateRoom = async (roomId: number, body: UpdateRoomBody): Promise<PublicRoomType> => {
    const { name, activeBoardStateId } = body;
    const data: any = {};

    if (name !== undefined) data.name = name;
    if (activeBoardStateId !== undefined) data.activeBoardStateId = activeBoardStateId;

    const row = await db.room.update({ where: { id: roomId }, data, select: publicRoomSelect });
    const dto = mapRoomRowToPublic(row);
    return PublicRoom.parse(dto);
  };

  const deleteRoom = async (roomId: number) => {
    await db.room.delete({ where: { id: roomId } });
  };

  return { findById, createRoom, updateRoom, deleteRoom };
};
