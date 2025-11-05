// server/src/middleware/errors.ts
import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { Prisma } from "../generated/prisma";

type ErrBody = {
  error: {
    type: "validation" | "conflict" | "not_found" | "bad_request" | "server";
    code?: string; // e.g. P2002, JSON_PARSE, ZOD_ISSUES
    message: string; // safe, client-facing
    details?: unknown; // optional extra info (zod issues, prisma meta)
    stack?: string; // only in dev
  };
};

// Optional: handle malformed JSON produced by express.json()
export function jsonParseGuard(err: any, _req: Request, res: Response, next: NextFunction) {
  if (err?.type === "entity.parse.failed") {
    const body: ErrBody = {
      error: {
        type: "bad_request",
        code: "JSON_PARSE",
        message: "Malformed JSON body",
      },
    };
    return res.status(400).json(body);
  }
  return next(err);
}

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (process.env.NODE_ENV !== "test") console.error(err);

  const isDev = process.env.NODE_ENV !== "production";

  // 1) Zod validation → 400 with issues
  if (err instanceof ZodError) {
    const body: ErrBody = {
      error: {
        type: "validation",
        code: "ZOD_ISSUES",
        message: "Validation failed",
        details: err, // include path, message, etc.
        ...(isDev ? { stack: err.stack } : {}),
      },
    };
    return res.status(400).json(body);
  }

  // 2) Prisma known codes
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    // Unique violation
    if (err.code === "P2002") {
      // err.meta?.target is usually the violated unique index/field
      const body: ErrBody = {
        error: {
          type: "conflict",
          code: "P2002",
          message: "Unique constraint failed",
          details: { target: (err.meta as any)?.target },
          ...(isDev ? { stack: err.stack } : {}),
        },
      };
      return res.status(409).json(body);
    }

    // Record not found
    if (err.code === "P2025") {
      const body: ErrBody = {
        error: {
          type: "not_found",
          code: "P2025",
          message: "Resource not found",
          ...(isDev ? { stack: err.stack } : {}),
        },
      };
      return res.status(404).json(body);
    }

    // Foreign key violation (sometimes reported as P2003)
    if (err.code === "P2003") {
      const body: ErrBody = {
        error: {
          type: "conflict",
          code: "P2003",
          message: "Operation violates a foreign key constraint",
          details: { field: (err.meta as any)?.field_name },
          ...(isDev ? { stack: err.stack } : {}),
        },
      };
      return res.status(409).json(body);
    }
  }

  // 3) Prisma validation at client level (bad data shape) → 400
  if (err instanceof Prisma.PrismaClientValidationError) {
    const body: ErrBody = {
      error: {
        type: "bad_request",
        code: "PRISMA_VALIDATION",
        message: "Invalid request data for database operation",
        ...(isDev ? { stack: (err as Error).stack } : {}),
      },
    };
    return res.status(400).json(body);
  }

  // 4) Prisma unknown request error → 500 (rare)
  if (err instanceof Prisma.PrismaClientUnknownRequestError) {
    const body: ErrBody = {
      error: {
        type: "server",
        code: "PRISMA_UNKNOWN",
        message: "Unexpected database error",
        ...(isDev ? { stack: (err as Error).stack } : {}),
      },
    };
    return res.status(500).json(body);
  }

  // 5) Fallback
  const body: ErrBody = {
    error: {
      type: "server",
      message: "Internal Server Error",
      ...(isDev && err instanceof Error ? { stack: err.stack } : {}),
    },
  };
  return res.status(500).json(body);
}
