import { Router } from "express";
import { prisma } from "../db/prisma";
import { IdParam, CreateBody, UpdateBody } from "../validators/users";

export const users = Router();

/**
 * TODO:
 * hash pwd bcrypt
 * flip anon in patch (note that post cant update once the anon is created -> duplicates)
 * add location header to the post (created resource)
 */

users.get("/:id", async (req, res, next) => {
  try {
    const { id } = IdParam.parse(req.params);
    const user = await prisma.user.findUniqueOrThrow({
      where: { id },
      select: {
        id: true,
        username: true,
        email: true,
        isAnonymous: true,
        createdAt: true,
      },
    });
    res.status(200).json(user);
  } catch (err) {
    next(err);
  }
});

//it is either empty or full body
users.post("/", async (req, res, next) => {
  try {
    const parsedBody = CreateBody.parse(req.body ?? {});
    if ("username" in parsedBody) {
      const { username, email, password } = parsedBody;

      // TODO: hash password at some point
      const pwdHash = password;

      const user = await prisma.user.create({
        data: { username, email, pwdHash, isAnonymous: false },
        select: { id: true, createdAt: true },
      });

      res.status(201).json(user);
    } else {
      const user = await prisma.$transaction(async (tx) => {
        const base = await tx.user.create({
          data: {},
          select: { id: true },
        });

        return tx.user.update({
          where: { id: base.id },
          data: { username: `User${base.id}` },
          select: { id: true, createdAt: true },
        });
      });

      res.status(201).json(user);
    }
  } catch (err) {
    next(err);
  }
});

users.patch("/:id", async (req, res, next) => {
  try {
    const { id } = IdParam.parse(req.params);
    const { username, email, password } = UpdateBody.parse(req.body);

    const data: any = {};

    if (username !== undefined) data.username = username;
    if (email !== undefined) data.email = email;
    if (password !== undefined) data.pwdHash = password; // needs to be hashed

    const user = await prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        username: true,
        email: true,
        isAnonymous: true,
        createdAt: true,
      },
    });

    res.status(200).json(user);
  } catch (err) {
    next(err);
  }
});

users.delete("/:id", async (req, res, next) => {
  try {
    const { id } = IdParam.parse(req.params);
    await prisma.user.delete({
      where: { id },
    });

    res.status(204).send();
  } catch (err) {
    next(err);
  }
});
