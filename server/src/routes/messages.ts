import { Router } from "express";
import { prisma } from "../db/prisma";

export const messages = Router();

messages.get("/:id", (req, res) => {});

messages.post("/", (req, res) => {});

messages.delete("/:id", (req, res) => {});

messages.put("/:id", (req, res) => {});
