import { CreateMessageBody, UpdateMessageBody } from "@collabboard/shared";
import { TxClient } from "./types/tx";
import { PublicMessage, PublicMessageType } from "./schemas/messageSchemas";
import { mapMessageRowToPublic, publicMessageSelect } from "./shapes/messageShape";

export const makeMessageRepo = (db: TxClient) => {
  const findById = async (messageId: number): Promise<PublicMessageType | null> => {
    const row = await db.message.findUnique({ where: { id: messageId }, select: publicMessageSelect });
    if (!row) return null;
    const dto = mapMessageRowToPublic(row);
    return PublicMessage.parse(dto);
  };

  const createMessage = async (author: string, body: CreateMessageBody): Promise<PublicMessageType> => {
    const row = await db.message.create({
      data: { ...body, author },
      select: publicMessageSelect,
    });
    const dto = mapMessageRowToPublic(row);
    return PublicMessage.parse(dto);
  };

  const updateMessage = async (messageId: number, body: UpdateMessageBody): Promise<PublicMessageType> => {
    const row = await db.message.update({ where: { id: messageId }, data: { ...body }, select: publicMessageSelect });
    const dto = mapMessageRowToPublic(row);
    return PublicMessage.parse(dto);
  };

  const deleteMessage = async (messageId: number) => {
    await db.message.delete({ where: { id: messageId } });
  };

  return { findById, createMessage, updateMessage, deleteMessage };
};
