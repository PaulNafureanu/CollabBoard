import { http } from "./http";
import type { CreateMembershipBody, PublicMembership, UpdateMembershipBody } from "@collabboard/shared";
import { Memberships, Common } from "@collabboard/shared";

const { CreateBody, UpdateBody } = Memberships.default;
const { Id } = Common.default;
const endpoint = "memberships";

const membershipsApi = {
  get: async (membershipId: number) => {
    const id = Id.parse(membershipId);
    const res = await http.get<PublicMembership>(`/${endpoint}/${id}`);
    return res.data;
  },

  create: async (payload: CreateMembershipBody) => {
    const p = CreateBody.parse(payload);
    const res = await http.post<PublicMembership>(`/${endpoint}`, p);
    return res.data;
  },

  update: async (membershipId: number, payload: UpdateMembershipBody) => {
    const id = Id.parse(membershipId);
    const p = UpdateBody.parse(payload);
    const res = await http.patch<PublicMembership>(`/${endpoint}/${id}`, p);
    return res.data;
  },

  remove: async (membershipId: number) => {
    const id = Id.parse(membershipId);
    await http.delete(`/${endpoint}/${id}`);
  },
};

export default membershipsApi;
