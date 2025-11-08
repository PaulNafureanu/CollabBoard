import { CreateMembershipBody, UpdateMembershipBody } from "@collabboard/shared";
import { Role, Status } from "../generated/prisma";
import { PublicMembership, PublicMembershipType } from "./schemas/membershipSchemas";
import { mapMembershipRowToPublic, publicMembershipSelect } from "./shapes/membershipShape";
import { TxClient } from "./types/tx";

export const makeMembershipRepo = (db: TxClient) => {
  const findById = async (membershipId: number): Promise<PublicMembershipType | null> => {
    const row = await db.membership.findUnique({ where: { id: membershipId }, select: publicMembershipSelect });
    if (!row) return null;
    const dto = mapMembershipRowToPublic(row);
    return PublicMembership.parse(dto);
  };

  const createMembership = async (body: CreateMembershipBody): Promise<PublicMembershipType> => {
    const role = body.role?.trim().toUpperCase() as Role | undefined;
    const status = body.status.trim().toUpperCase() as Status;
    const row = await db.membership.create({
      data: { ...body, role: role ?? "MEMBER", status },
      select: publicMembershipSelect,
    });
    const dto = mapMembershipRowToPublic(row);
    return PublicMembership.parse(dto);
  };

  const updateMembership = async (membershipId: number, body: UpdateMembershipBody): Promise<PublicMembershipType> => {
    const role = body.role.trim().toUpperCase() as Role;
    const status = body.status.trim().toUpperCase() as Status;
    const row = await db.membership.update({
      where: { id: membershipId },
      data: { ...body, role, status },
      select: publicMembershipSelect,
    });
    const dto = mapMembershipRowToPublic(row);
    return PublicMembership.parse(dto);
  };

  const deleteMembership = async (membershipId: number) => {
    await db.membership.delete({ where: { id: membershipId } });
  };

  return { findById, createMembership, updateMembership, deleteMembership };
};
