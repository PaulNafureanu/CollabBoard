import { Router } from "express";
import { prisma } from "../db/prisma";

export const memberships = Router();

memberships.get("/:id", (req, res) => {});

memberships.post("/", (req, res) => {});

memberships.delete("/:id", (req, res) => {});

memberships.put("/:id", (req, res) => {});
