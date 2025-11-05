import { http } from "./http";
import type { CreateUserBody, PublicUser, UpdateUserBody } from "@collabboard/shared";
import { Users, Common } from "@collabboard/shared";

const { CreateBody, UpdateBody } = Users.default;
const { Id } = Common.default;
const endpoint = "users";

const usersApi = {
  get: async (userId: number) => {
    const id = Id.parse(userId);
    const res = await http.get<PublicUser>(`/${endpoint}/${id}`);
    return res.data;
  },

  create: async (payload: CreateUserBody) => {
    const p = CreateBody.parse(payload);
    const res = await http.post<PublicUser>(`/${endpoint}`, p);
    return res.data;
  },

  update: async (userId: number, payload: UpdateUserBody) => {
    const id = Id.parse(userId);
    const p = UpdateBody.parse(payload);
    const res = await http.patch<PublicUser>(`/${endpoint}/${id}`, p);
    return res.data;
  },

  remove: async (userId: number) => {
    const id = Id.parse(userId);
    await http.delete(`/${endpoint}/${id}`);
  },
};

export default usersApi;
