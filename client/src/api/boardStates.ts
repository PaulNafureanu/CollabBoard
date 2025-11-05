import { http } from "./http";
import type { CreateBoardStateBody, PublicBoardState } from "@collabboard/shared";
import { BoardStates, Common } from "@collabboard/shared";

const { CreateBody } = BoardStates.default;
const { Id } = Common.default;
const endpoint = "boardstates";

const boardStatesApi = {
  get: async (boardStateId: number) => {
    const id = Id.parse(boardStateId);
    const res = await http.get<PublicBoardState>(`/${endpoint}/${id}`);
    return res.data;
  },

  create: async (payload: CreateBoardStateBody) => {
    const p = CreateBody.parse(payload);
    const res = await http.post<PublicBoardState>(`/${endpoint}`, p);
    return res.data;
  },

  remove: async (boardStateId: number) => {
    const id = Id.parse(boardStateId);
    await http.delete(`/${endpoint}/${id}`);
  },
};

export default boardStatesApi;
