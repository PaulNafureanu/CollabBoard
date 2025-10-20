import { Router } from "express";
import { prisma } from "../db/prisma";
import { IdParam } from "../validators/common";
import { PublicMembership } from "../common/publicShapes";
import { CreateBody, UpdateBody } from "../validators/memberships";
import { Role } from "../generated/prisma";

export const memberships = Router();

memberships.get("/:id", async (req, res, next) => {
  try {
    const { id } = IdParam.parse(req.params);
    const membership = await prisma.membership.findUniqueOrThrow({
      where: { id },
      select: PublicMembership,
    });

    res.status(200).json(membership);
  } catch (err) {
    next(err);
  }
});

memberships.post("/", async (req, res, next) => {
  try {
    const { userId, roomId, role } = CreateBody.parse(req.body);
    const membership = await prisma.membership.create({
      data: {
        userId,
        roomId,
        role: role ? (role.trim().toUpperCase() as Role) : "MEMBER",
      },
      select: PublicMembership,
    });

    res.status(201).location(`/memberships/${membership.id}`).json(membership);
  } catch (err) {
    next(err);
  }
});

memberships.patch("/:id", async (req, res, next) => {
  try {
    const { id } = IdParam.parse(req.params);
    const { role } = UpdateBody.parse(req.body);

    const membership = await prisma.membership.update({
      where: { id },
      data: { role: role.trim().toUpperCase() as Role },
      select: PublicMembership,
    });

    res.status(200).json(membership);
  } catch (err) {
    next(err);
  }
});

memberships.delete("/:id", async (req, res, next) => {
  try {
    const { id } = IdParam.parse(req.params);
    await prisma.membership.delete({ where: { id } });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});
