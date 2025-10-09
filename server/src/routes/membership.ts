import { Router } from "express";
import { prisma } from "../db/prisma";

export const membership = Router();

membership.get("/:id", (req, res) => {});

membership.post("/", (req, res) => {});

membership.delete("/:id", (req, res) => {});

membership.put("/:id", (req, res) => {});
