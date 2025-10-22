export type CursorMove = {
  roomId: number;
  userId: number;
  x: number;
  y: number;
  ts: number;
};

export type ClientToServerEvents = {
  cursor_move: (payload: CursorMove) => void;
};

export type ServerToClientEvents = {
  cursor_move: (payload: CursorMove) => void;
};
