export type PageData<T extends Object> = {
  items: T[];
  page: number;
  size: number;
  totalItems: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
};

export enum Role {
  OWNER,
  MODERATOR,
  EDITOR,
  MEMBER,
  VIEWER,
  PENDING,
  BANNED,
}

export type PublicUser = {
  id: number;
  username: string;
  email: string;
  isAnonymous: boolean;
  createdAt: string;
};

export type PublicRoom = {
  id: number;
  slug: string;
  createdAt: string;
  updatedAt: string;
  activeBoardStateId: number;
};

export type PublicBoardState = {
  id: number;
  boardId: number;
  version: number;
  payload: string;
  createdAt: string;
};

export type PublicBoard = {
  id: number;
  roomId: number;
  createdAt: string;
  updatedAt: string;
  lastState: number;
};

export type PublicMembership = {
  id: number;
  userId: number;
  roomId: number;
  role: Role;
  joinedAt: string;
};

export type PublicMessage = {
  id: number;
  roomId: number;
  userId: number;
  author: string;
  text: string;
  createdAt: string;
};

export type PublicShapes =
  | PublicUser
  | PublicRoom
  | PublicBoard
  | PublicBoardState
  | PublicMembership
  | PublicMessage;
