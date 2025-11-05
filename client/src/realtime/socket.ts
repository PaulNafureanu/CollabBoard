import { io, Socket } from "socket.io-client";
import type { ServerToClientEvents, ClientToServerEvents } from "@collabboard/shared";

declare global {
  interface Window {
    __collabboard_socket?: Socket<ServerToClientEvents, ClientToServerEvents>;
  }
}

const BASE_URL = (import.meta.env.VITE_API_URL as string | undefined) ?? "http://localhost:3000";

const URL = `${BASE_URL}/rooms`;

let socket: Socket<ServerToClientEvents, ClientToServerEvents> | null = null;

const ensureSocket = () => {
  if (socket) return socket;

  if (import.meta.env.DEV && typeof window !== "undefined" && window.__collabboard_socket) {
    socket = window.__collabboard_socket;
    return socket;
  }

  socket = io(URL, {
    path: "/socket.io",
    withCredentials: true,
    autoConnect: false,
  });
  if (import.meta.env.DEV && typeof window !== "undefined") window.__collabboard_socket = socket;
  return socket;
};

export function setSocketAuth(token?: string) {
  ensureSocket().auth = token ? { token } : {};
}

export function connectSocket() {
  const socket = ensureSocket();
  if (!socket.connected) socket.connect();
}

export function disconnectSocket() {
  const socket = ensureSocket();
  if (socket.connected) socket.disconnect();
}

export function getSocket() {
  return ensureSocket();
}

let wired = false;
export function wireGlobalSocketLogs() {
  if (wired) return;
  wired = true;

  const socket = ensureSocket();
  socket.on("connect", () => console.log("[socket] connected", socket.id));
  socket.on("disconnect", (reason) => console.log("[socket] disconnected: ", reason));
  socket.on("connect_error", (err) => console.error("[socket] connect error: ", err.message));
}
