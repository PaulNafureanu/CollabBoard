import type { Prisma, PrismaClient } from "../generated/prisma";
import type { Role, Status } from "../generated/prisma";

export type { Prisma, PrismaClient, Role, Status };
export type TxClient = PrismaClient | Prisma.TransactionClient;
export type Tx = Prisma.TransactionClient;
