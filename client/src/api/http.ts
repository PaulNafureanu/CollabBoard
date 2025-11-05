import axios, { AxiosError } from "axios";

const API_URL = (import.meta.env.VITE_API_URL as string) ?? "http://localhost:3000";

export const http = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  timeout: 10_000,
});

http.interceptors.response.use(
  (res) => res,
  (err: AxiosError) => {
    // TODO: Error handler
    return Promise.reject(err);
  },
);
