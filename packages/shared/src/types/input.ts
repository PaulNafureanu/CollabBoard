import * as z from "zod";
import {
  Boards,
  BoardStates,
  Users,
  Rooms,
  Memberships,
  Messages,
  Common,
} from "./../index";

export type CreateUserBody = z.infer<typeof Users.default.CreateBody>;
export type UpdateUserBody = z.infer<typeof Users.default.UpdateBody>;

export type CreateBoardBody = z.infer<typeof Boards.default.CreateBody>;
export type UpdateBoardBody = z.infer<typeof Boards.default.UpdateBody>;
export type BoardQueryType = z.infer<typeof Boards.default.BoardQuery>;

export type CreateBoardStateBody = z.infer<
  typeof BoardStates.default.CreateBody
>;

export type CreateRoomBody = z.infer<typeof Rooms.default.CreateBody>;
export type UpdateRoomBody = z.infer<typeof Rooms.default.UpdateBody>;

export type CreateMembershipBody = z.infer<
  typeof Memberships.default.CreateBody
>;
export type UpdateMembershipBody = z.infer<
  typeof Memberships.default.UpdateBody
>;

export type CreateMessageBody = z.infer<typeof Messages.default.CreateBody>;
export type UpdateMessageBody = z.infer<typeof Messages.default.UpdateBody>;

export type PageQueryType = z.infer<typeof Common.default.PageQuery>;
