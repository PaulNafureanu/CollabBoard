import { prisma } from "./prisma";
import type { Tx } from "./types/types";

export const inTx = async <T>(tx: Tx | undefined, fn: (db: Tx) => Promise<T>): Promise<T> => {
  return tx ? await fn(tx) : await prisma.$transaction(fn);
};
