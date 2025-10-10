import { Router } from "express";
import { prisma } from "../db/prisma";

export const boards = Router();

boards.get("/:id", async (req, res, next) => {});

boards.post("/", async (req, res, next) => {});

boards.patch("/:id", async (req, res, next) => {});

boards.delete("/:id", async (req, res, next) => {});
