import type { CreateUserBody, UpdateUserBody } from "@collabboard/shared";
import * as bcrypt from "bcrypt";
import { PublicUser, type PublicUserType } from "./schemas/userSchemas";
import { Prisma, TxClient, userPublicSelect } from "../db";
import { toUserPublic } from "../domain";

const SALT_ROUNDS = Number(process.env.SALT_ROUNDS ?? 12);

export type UserRepo = ReturnType<typeof makeUserRepo>;

export const makeUserRepo = (db: TxClient) => {
  const findById = async (userId: number): Promise<PublicUserType | null> => {
    const row = await db.user.findUnique({ where: { id: userId }, select: userPublicSelect });
    if (!row) return null;
    const dto = toUserPublic(row);
    return PublicUser.parse(dto);
  };

  const createEmptyUser = async (): Promise<PublicUserType> => {
    const row = await db.user.create({ data: {}, select: userPublicSelect });
    const dto = toUserPublic(row);
    return PublicUser.parse(dto);
  };

  const setFieldsToEmptyUser = async (baseId: number): Promise<PublicUserType> => {
    const row = await db.user.update({
      where: { id: baseId },
      data: { username: `User${baseId}` },
      select: userPublicSelect,
    });
    const dto = toUserPublic(row);
    return PublicUser.parse(dto);
  };

  const createPermUser = async (body: CreateUserBody): Promise<PublicUserType> => {
    const { username, email, password } = body;
    const pwdHash = await bcrypt.hash(password, SALT_ROUNDS);
    const row = await db.user.create({
      data: { username, email: email.toLowerCase(), pwdHash, isAnonymous: false },
      select: userPublicSelect,
    });
    const dto = toUserPublic(row);
    return PublicUser.parse(dto);
  };

  const updateUser = async (userId: number, body: UpdateUserBody) => {
    const { username, email, password } = body;
    const data: Prisma.UserUpdateInput = {};

    if (username !== undefined) data.username = username;
    if (email !== undefined) data.email = email.toLowerCase();
    if (password !== undefined) data.pwdHash = await bcrypt.hash(password, SALT_ROUNDS);
    data.isAnonymous = false;

    const row = await db.user.update({ where: { id: userId }, data, select: userPublicSelect });
    const dto = toUserPublic(row);
    return PublicUser.parse(dto);
  };

  const deleteUser = async (userId: number) => {
    await db.user.delete({ where: { id: userId } });
  };

  return { findById, createEmptyUser, setFieldsToEmptyUser, createPermUser, updateUser, deleteUser };
};
