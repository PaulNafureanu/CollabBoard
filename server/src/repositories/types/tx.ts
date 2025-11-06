import type { Prisma, PrismaClient } from "../../generated/prisma";

export type TxClient = PrismaClient | Prisma.TransactionClient;
