import * as bcrypt from "bcrypt";
import { Prisma, TxClient, userPublicSelect } from "../db";
import { toUserPublic } from "../domain";
import { UserCreate, UserPublic, UserPublicSchema, UserUpdate } from "@collabboard/shared";

const SALT_ROUNDS = Number(process.env.SALT_ROUNDS ?? 12);

export type UserRepo = ReturnType<typeof makeUserRepo>;

export const makeUserRepo = (db: TxClient) => {
  const findById = async (userId: number): Promise<UserPublic | null> => {
    const row = await db.user.findUnique({ where: { id: userId }, select: userPublicSelect });
    if (!row) return null;
    const dto = toUserPublic(row);
    return UserPublicSchema.parse(dto);
  };

  const createEmptyUser = async (): Promise<UserPublic> => {
    const row = await db.user.create({ data: {}, select: userPublicSelect });
    const dto = toUserPublic(row);
    return UserPublicSchema.parse(dto);
  };

  const setFieldsToEmptyUser = async (baseId: number): Promise<UserPublic> => {
    const row = await db.user.update({
      where: { id: baseId },
      data: { username: `User${baseId}` },
      select: userPublicSelect,
    });
    const dto = toUserPublic(row);
    return UserPublicSchema.parse(dto);
  };

  const createPermUser = async (body: UserCreate): Promise<UserPublic> => {
    const { username, email, password } = body;
    const pwdHash = await bcrypt.hash(password, SALT_ROUNDS);
    const row = await db.user.create({
      data: { username, email: email.toLowerCase(), pwdHash, isAnonymous: false },
      select: userPublicSelect,
    });
    const dto = toUserPublic(row);
    return UserPublicSchema.parse(dto);
  };

  const updateUser = async (userId: number, body: UserUpdate): Promise<UserPublic> => {
    const { username, email, password } = body;
    const data: Prisma.UserUpdateInput = {};

    if (username !== undefined) data.username = username;
    if (email !== undefined) data.email = email.toLowerCase();
    if (password !== undefined) data.pwdHash = await bcrypt.hash(password, SALT_ROUNDS);
    data.isAnonymous = false;

    const row = await db.user.update({ where: { id: userId }, data, select: userPublicSelect });
    const dto = toUserPublic(row);
    return UserPublicSchema.parse(dto);
  };

  const deleteUser = async (userId: number) => {
    await db.user.delete({ where: { id: userId } });
  };

  return { findById, createEmptyUser, setFieldsToEmptyUser, createPermUser, updateUser, deleteUser };
};
