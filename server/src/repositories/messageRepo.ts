import { CreateMessageBody, UpdateMessageBody } from "@collabboard/shared";
import { PublicMessage, PublicMessageType } from "./schemas/messageSchemas";
import { buildDBPageQuery, OrderByKey } from "./shared/page";
import { parseMany } from "./shared/parser";
import { messagePublicSelect, TxClient } from "../db";
import { toMessagePublic } from "../domain";

export const makeMessageRepo = (db: TxClient) => {
  const count = async (roomId: number): Promise<number> => {
    return await db.message.count({ where: { roomId } });
  };

  const findById = async (messageId: number): Promise<PublicMessageType | null> => {
    const row = await db.message.findUnique({ where: { id: messageId }, select: messagePublicSelect });
    if (!row) return null;
    const dto = toMessagePublic(row);
    return PublicMessage.parse(dto);
  };

  const getPageByRoomId = async (roomId: number, page: number, size: number): Promise<PublicMessageType[]> => {
    const rows = await db.message.findMany(
      buildDBPageQuery({ roomId }, OrderByKey.createdAt, page, size, messagePublicSelect),
    );
    if (rows.length === 0) return [];
    return parseMany(rows, toMessagePublic, PublicMessage);
  };

  const createMessage = async (author: string, body: CreateMessageBody): Promise<PublicMessageType> => {
    const row = await db.message.create({
      data: { ...body, author },
      select: messagePublicSelect,
    });
    const dto = toMessagePublic(row);
    return PublicMessage.parse(dto);
  };

  const updateMessage = async (messageId: number, body: UpdateMessageBody): Promise<PublicMessageType> => {
    const row = await db.message.update({ where: { id: messageId }, data: { ...body }, select: messagePublicSelect });
    const dto = toMessagePublic(row);
    return PublicMessage.parse(dto);
  };

  const deleteMessage = async (messageId: number) => {
    await db.message.delete({ where: { id: messageId } });
  };

  return { findById, count, getPageByRoomId, createMessage, updateMessage, deleteMessage };
};
