import type { Server } from "socket.io";

let ioRef: Server | null;

export const setIO = (s: Server) => {
  ioRef = s;
};

export const getIO = () => {
  if (!ioRef) throw new Error("Socket.IO not initialized!");
  return ioRef;
};
