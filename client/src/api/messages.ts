import { http } from "./http";
import type {
  CreateMessageBody,
  PublicMessage,
  UpdateMessageBody,
} from "@collabboard/shared";
import { Messages, Common } from "@collabboard/shared";

const { CreateBody, UpdateBody } = Messages.default;
const { Id } = Common.default;
const endpoint = "messages";

const messagesApi = {
  get: async (messageId: number) => {
    const id = Id.parse(messageId);
    const res = await http.get<PublicMessage>(`/${endpoint}/${id}`);
    return res.data;
  },

  create: async (payload: CreateMessageBody) => {
    const p = CreateBody.parse(payload);
    const res = await http.post<PublicMessage>(`/${endpoint}`, p);
    return res.data;
  },

  update: async (messageId: number, payload: UpdateMessageBody) => {
    const id = Id.parse(messageId);
    const p = UpdateBody.parse(payload);
    const res = await http.patch<PublicMessage>(`/${endpoint}/${id}`, p);
    return res.data;
  },

  remove: async (messageId: number) => {
    const id = Id.parse(messageId);
    await http.delete(`/${endpoint}/${id}`);
  },
};

export default messagesApi;
