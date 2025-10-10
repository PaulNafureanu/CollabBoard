import { Router } from "express";
import { prisma } from "../db/prisma";
import { CreateBody, UpdateBody } from "../validators/users";
import { IdParam } from "../validators/common";
import * as bcrypt from "bcrypt";

export const users = Router();

const PublicUser = {
  id: true,
  username: true,
  email: true,
  isAnonymous: true,
  createdAt: true,
};

users.get("/:id", async (req, res, next) => {
  try {
    const { id } = IdParam.parse(req.params);
    const user = await prisma.user.findUniqueOrThrow({
      where: { id },
      select: PublicUser,
    });
    res.status(200).json(user);
  } catch (err) {
    next(err);
  }
});

/**
 * First use of the client app -> automatic post req for anonymous user (App's logic)
 * User wants to create an account -> post req with the userdata (User's Intent)
 */

users.post("/", async (req, res, next) => {
  try {
    const parsedBody = CreateBody.parse(req.body ?? {});
    if ("username" in parsedBody) {
      const { username, email, password } = parsedBody;

      const pwdHash = await bcrypt.hash(password, 12);

      const user = await prisma.user.create({
        data: {
          username,
          email: email.toLowerCase(),
          pwdHash,
          isAnonymous: false,
        },
        select: PublicUser,
      });

      res.status(201).location(`/users/${user.id}`).json(user);
    } else {
      const user = await prisma.$transaction(async (tx) => {
        const base = await tx.user.create({
          data: {},
          select: { id: true },
        });

        return tx.user.update({
          where: { id: base.id },
          data: { username: `User${base.id}` },
          select: PublicUser,
        });
      });

      res.status(201).location(`/users/${user.id}`).json(user);
    }
  } catch (err) {
    next(err);
  }
});

/**
 * User wants to switch from temp anonymous user to perm user, or update the userdata.
 */
users.patch("/:id", async (req, res, next) => {
  try {
    const { id } = IdParam.parse(req.params);
    const { username, email, password } = UpdateBody.parse(req.body);

    const data: any = {};

    if (username !== undefined) data.username = username;
    if (email !== undefined) data.email = email.toLowerCase();
    if (password !== undefined) data.pwdHash = await bcrypt.hash(password, 12);
    data.isAnonymous = false;

    const user = await prisma.user.update({
      where: { id },
      data,
      select: PublicUser,
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
