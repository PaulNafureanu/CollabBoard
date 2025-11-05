import type { AppContext } from "../context";

declare global {
  namespace Express {
    interface Locals {
      ctx: AppContext;
    }
  }
}
