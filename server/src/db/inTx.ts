import { prisma } from "./prisma";
import { Prisma } from "../generated/prisma";

export type Tx = Prisma.TransactionClient;

export const inTx = async <T>(tx: Tx | undefined, fn: (db: Tx) => Promise<T>): Promise<T> => {
  return tx ? await fn(tx) : await prisma.$transaction(fn);
};
