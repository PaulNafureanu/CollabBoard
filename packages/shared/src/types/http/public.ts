export type PageData<T extends Object> = {
  items: T[];
  page: number;
  size: number;
  totalItems: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
};

export enum Status {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  BANNED = "BANNED",
}

export enum Role {
  OWNER = "OWNER",
  MODERATOR = "MODERATOR",
  EDITOR = "EDITOR",
  MEMBER = "MEMBER",
  VIEWER = "VIEWER",
}

export type PublicUser = {
  id: number;
  username: string;
  email: string;
  isAnonymous: boolean;
  createdAt: Date;
};

export type PublicRoom = {
  id: number;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  activeBoardStateId: number;
};

export type PublicMembership = {
  id: number;
  userId: number;
  roomId: number;
  role: Role;
  status: Status;
  joinedAt: Date;
  updatedAt: Date;
};

export type PublicMessage = {
  id: number;
  roomId: number;
  userId: number;
  author: string;
  text: string;
  createdAt: Date;
};

export type PublicBoard = {
  id: number;
  roomId: number;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  lastState: number;
};

export type PublicBoardState = {
  id: number;
  boardId: number;
  version: number;
  payload: string;
  createdAt: Date;
};

export type PublicShapes = PublicUser | PublicRoom | PublicBoard | PublicBoardState | PublicMembership | PublicMessage;
