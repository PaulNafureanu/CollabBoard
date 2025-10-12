import { Prisma } from "../generated/prisma";

export interface PageData<T extends Object> {
  items: T[];
  page: number;
  size: number;
  totalItems: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export const getPageData = <T extends Object>(
  items: T[],
  page: number,
  size: number,
  totalItems: number,
) => {
  const totalPages = Math.max(1, Math.ceil(totalItems / size));
  return {
    items,
    page,
    size,
    totalItems,
    totalPages,
    hasNext: page + 1 < totalPages,
    hasPrev: page > 0,
  } as PageData<T>;
};

export const PublicUser = {
  id: true,
  username: true,
  email: true,
  isAnonymous: true,
  createdAt: true,
};

export const PublicRoom = {
  id: true,
  slug: true,
  createdAt: true,
  updatedAt: true,
  activeBoardId: true,
  activeBoardStateId: true,
};

export const PublicBoardState = {
  id: true,
  boardId: true,
  version: true,
  payload: true,
  createdAt: true,
  updatedAt: true,
};

export const PublicBoard = {
  id: true,
  roomId: true,
  createdAt: true,
  updatedAt: true,
  states: true,
};

export const PublicMembership = {
  id: true,
  roomId: true,
  userId: true,
  author: true,
  text: true,
  createAt: true,
};

export const PublicMessages = {
  id: true,
  roomId: true,
  userId: true,
  author: true,
  text: true,
  createdAt: true,
};

export const DefaultBoardStatePayload: Prisma.InputJsonValue = {};
