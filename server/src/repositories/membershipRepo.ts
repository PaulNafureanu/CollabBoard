import { CreateMembershipBody, UpdateMembershipBody } from "@collabboard/shared";
import { PublicMembership, PublicMembershipType } from "./schemas/membershipSchemas";
import { membershipPublicSelect } from "../db/shapes/membershipShape";
import { buildDBPageQuery, OrderByKey } from "./shared/page";
import { parseMany } from "./shared/parser";
import { Role, Status, TxClient } from "../db";
import { toMembershipPublic } from "../domain";

export const makeMembershipRepo = (db: TxClient) => {
  const countByRoomId = async (roomId: number): Promise<number> => {
    return await db.membership.count({ where: { roomId } });
  };

  const countByUserId = async (userId: number): Promise<number> => {
    return await db.membership.count({ where: { userId } });
  };

  const findById = async (membershipId: number): Promise<PublicMembershipType | null> => {
    const row = await db.membership.findUnique({ where: { id: membershipId }, select: membershipPublicSelect });
    if (!row) return null;
    const dto = toMembershipPublic(row);
    return PublicMembership.parse(dto);
  };

  const getPageByRoomId = async (roomId: number, page: number, size: number): Promise<PublicMembershipType[]> => {
    const rows = await db.membership.findMany(
      buildDBPageQuery({ roomId }, OrderByKey.createdAt, page, size, membershipPublicSelect),
    );
    if (rows.length === 0) return [];
    return parseMany(rows, toMembershipPublic, PublicMembership);
  };

  const getPageByUserId = async (userId: number, page: number, size: number): Promise<PublicMembershipType[]> => {
    const rows = await db.membership.findMany(
      buildDBPageQuery({ userId }, OrderByKey.joinedAt, page, size, membershipPublicSelect),
    );
    if (rows.length === 0) return [];
    return parseMany(rows, toMembershipPublic, PublicMembership);
  };

  const createMembership = async (body: CreateMembershipBody): Promise<PublicMembershipType> => {
    const role = body.role?.trim().toUpperCase() as Role | undefined;
    const status = body.status.trim().toUpperCase() as Status;
    const row = await db.membership.create({
      data: { ...body, role: role ?? "MEMBER", status },
      select: membershipPublicSelect,
    });
    const dto = toMembershipPublic(row);
    return PublicMembership.parse(dto);
  };

  const updateMembership = async (membershipId: number, body: UpdateMembershipBody): Promise<PublicMembershipType> => {
    const role = body.role.trim().toUpperCase() as Role;
    const status = body.status.trim().toUpperCase() as Status;
    const row = await db.membership.update({
      where: { id: membershipId },
      data: { ...body, role, status },
      select: membershipPublicSelect,
    });
    const dto = toMembershipPublic(row);
    return PublicMembership.parse(dto);
  };

  const deleteMembership = async (membershipId: number) => {
    await db.membership.delete({ where: { id: membershipId } });
  };

  return {
    findById,
    countByRoomId,
    countByUserId,
    getPageByRoomId,
    getPageByUserId,
    createMembership,
    updateMembership,
    deleteMembership,
  };
};
