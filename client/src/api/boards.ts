import { http } from "./http";
import type {
  BoardQueryType,
  CreateBoardBody,
  PublicBoard,
  UpdateBoardBody,
} from "@collabboard/shared";
import { Boards, Common } from "@collabboard/shared";

const { CreateBody, UpdateBody, BoardQuery } = Boards.default;
const { Id } = Common.default;
const endpoint = "boards";

const boardsApi = {
  get: async (boardId: number) => {
    const id = Id.parse(boardId);
    const res = await http.get<PublicBoard>(`/${endpoint}/${id}`);
    return res.data;
  },

  create: async (payload: CreateBoardBody) => {
    const p = CreateBody.parse(payload);
    const res = await http.post<PublicBoard>(`/${endpoint}`, p);
    return res.data;
  },

  update: async (
    boardId: number,
    payload: UpdateBoardBody,
    query: BoardQueryType,
  ) => {
    const id = Id.parse(boardId);
    const p = UpdateBody.parse(payload);
    const q = BoardQuery.parse(query);
    const res = await http.patch<PublicBoard>(`/${endpoint}/${id}`, p, {
      params: q,
    });
    return res.data;
  },

  remove: async (boardId: number) => {
    const id = Id.parse(boardId);
    await http.delete(`/${endpoint}/${id}`);
  },
};

export default boardsApi;
