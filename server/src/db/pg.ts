import { Client } from "pg";

const url = process.env.DATABASE_URL!;
export const pg = new Client({ connectionString: url });

// console.log(pg); // Note to self: change private fields to pool

export async function ensurePg() {
  if ((pg as any)._connecting || (pg as any)._connected) return;
  await pg.connect();
}
