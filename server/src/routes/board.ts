import { Router } from "express";
import { prisma } from "../db/prisma";

export const board = Router();

board.get("/:id", (req, res) => {});

board.post("/", (req, res) => {});

board.delete("/:id", (req, res) => {});

board.put("/:id", (req, res) => {});
