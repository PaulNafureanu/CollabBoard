import { http } from "./http";
import type {
  CreateRoomBody,
  PublicRoom,
  UpdateRoomBody,
} from "@collabboard/shared";
import { Rooms, Common } from "@collabboard/shared";

const { CreateBody, UpdateBody } = Rooms.default;
const { Id } = Common.default;
const endpoint = "rooms";

const roomsApi = {
  get: async (roomId: number) => {
    const id = Id.parse(roomId);
    const res = await http.get<PublicRoom>(`/${endpoint}/${id}`);
    return res.data;
  },

  create: async (payload: CreateRoomBody) => {
    const p = CreateBody.parse(payload);
    const res = await http.post<PublicRoom>(`/${endpoint}`, p);
    return res.data;
  },

  update: async (roomId: number, payload: UpdateRoomBody) => {
    const id = Id.parse(roomId);
    const p = UpdateBody.parse(payload);
    const res = await http.patch<PublicRoom>(`/${endpoint}/${id}`, p);
    return res.data;
  },

  remove: async (roomId: number) => {
    const id = Id.parse(roomId);
    await http.delete(`/${endpoint}/${id}`);
  },
};

export default roomsApi;
