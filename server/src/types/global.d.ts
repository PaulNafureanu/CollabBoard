import type { AppContext } from "../context/context";

declare global {
  namespace Express {
    interface Locals {
      ctx: AppContext;
    }
  }
}
