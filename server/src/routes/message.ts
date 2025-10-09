import { Router } from "express";
import { prisma } from "../db/prisma";

export const message = Router();

message.get("/:id", (req, res) => {});

message.post("/", (req, res) => {});

message.delete("/:id", (req, res) => {});

message.put("/:id", (req, res) => {});
