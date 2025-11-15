import z from "zod";

const TEXT_MAX_LEN = 4096;
const PAGE_MAX_SIZE = 100;

// general
export const Id = z.coerce.number().int().positive();
export const MsEpoch = z.number().int().nonnegative();
export const PosNumber = z.number().nonnegative();
export const Name = z.string().trim().min(1).max(64);
export const Flag = z.boolean();
export const Text = z.string().min(1).max(TEXT_MAX_LEN);

// db related
export const RoleSchema = z.enum(["OWNER", "MODERATOR", "EDITOR", "MEMBER", "VIEWER"]);
export const StatusSchema = z.enum(["PENDING", "APPROVED", "BANNED"]);
export type Role = z.infer<typeof RoleSchema>;
export type Status = z.infer<typeof StatusSchema>;

// pagimation
export const Page = z.coerce.number().int().min(0).default(0);
export const Size = z.coerce.number().int().min(1).max(PAGE_MAX_SIZE).default(20);
