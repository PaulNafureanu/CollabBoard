import { MembershipCreate, MembershipPublic, MembershipPublicSchema, MembershipUpdate } from "@collabboard/shared";
import { Prisma, TxClient } from "../db";
import { membershipPublicSelect } from "../db/shapes/membershipShape";
import { toMembershipPublic } from "../domain";
import { buildDBPageQuery, OrderByKey } from "./shared/page";
import { parseMany } from "./shared/parser";

export const makeMembershipRepo = (db: TxClient) => {
  const countByRoomId = async (roomId: number): Promise<number> => {
    return await db.membership.count({ where: { roomId } });
  };

  const countByUserId = async (userId: number): Promise<number> => {
    return await db.membership.count({ where: { userId } });
  };

  const findById = async (membershipId: number): Promise<MembershipPublic | null> => {
    const row = await db.membership.findUnique({ where: { id: membershipId }, select: membershipPublicSelect });
    if (!row) return null;
    const dto = toMembershipPublic(row);
    return MembershipPublicSchema.parse(dto);
  };

  const getPageByRoomId = async (roomId: number, page: number, size: number): Promise<MembershipPublic[]> => {
    const rows = await db.membership.findMany(
      buildDBPageQuery({ roomId }, OrderByKey.createdAt, page, size, membershipPublicSelect),
    );
    if (rows.length === 0) return [];
    return parseMany(rows, toMembershipPublic, MembershipPublicSchema);
  };

  const getPageByUserId = async (userId: number, page: number, size: number): Promise<MembershipPublic[]> => {
    const rows = await db.membership.findMany(
      buildDBPageQuery({ userId }, OrderByKey.joinedAt, page, size, membershipPublicSelect),
    );
    if (rows.length === 0) return [];
    return parseMany(rows, toMembershipPublic, MembershipPublicSchema);
  };

  const createMembership = async (body: MembershipCreate): Promise<MembershipPublic> => {
    const role = body.role;
    const status = body.status;
    const row = await db.membership.create({
      data: { ...body, role: role ?? "MEMBER", status },
      select: membershipPublicSelect,
    });
    const dto = toMembershipPublic(row);
    return MembershipPublicSchema.parse(dto);
  };

  const updateMembership = async (membershipId: number, body: MembershipUpdate): Promise<MembershipPublic | null> => {
    let data: Prisma.MembershipUpdateInput = {};
    if (body.role) data.role = body.role;
    if (body.status) data.status = body.status;
    if (!data || Object.keys(data).length === 0) return null;
    const row = await db.membership.update({
      where: { id: membershipId },
      data: { ...data },
      select: membershipPublicSelect,
    });
    const dto = toMembershipPublic(row);
    return MembershipPublicSchema.parse(dto);
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
