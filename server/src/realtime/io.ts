import type { ServerType } from "./types";

let ioRef: ServerType | null;

export const setIO = (s: ServerType) => {
  ioRef = s;
};

export const getIO = () => {
  if (!ioRef) throw new Error("Socket.IO not initialized!");
  return ioRef;
};
