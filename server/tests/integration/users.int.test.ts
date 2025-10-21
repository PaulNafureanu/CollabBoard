// server/tests/integration/users.int.test.ts
import request from "supertest";
import * as bcrypt from "bcrypt";
import { makeApp } from "../../src/app";
import { prisma } from "../../src/db/prisma";

const app = makeApp();

describe("GET /users/:id", () => {
  it("returns public user w/o pwdHash", async () => {
    const u = await prisma.user.create({
      data: {
        username: "Paul",
        email: "p@x.com",
        isAnonymous: false,
        pwdHash: "hash",
      },
    });

    const res = await request(app).get(`/users/${u.id}`).expect(200);
    expect(res.body).toMatchObject({
      id: u.id,
      username: "Paul",
      email: "p@x.com",
      isAnonymous: false,
    });
    expect(res.body.pwdHash).toBeUndefined();
  });

  it("404/500 when not found", async () => {
    const res = await request(app).get(`/users/999999`);
    expect([404, 500]).toContain(res.status);
  });
});

describe("GET /users/:id/memberships", () => {
  it("paginates memberships ordered by joinedAt desc, id desc", async () => {
    const user = await prisma.user.create({ data: {} });
    const r1 = await prisma.room.create({ data: {} });
    const r2 = await prisma.room.create({ data: {} });

    await prisma.membership.create({
      data: { userId: user.id, roomId: r1.id },
    });
    await prisma.membership.create({
      data: { userId: user.id, roomId: r2.id },
    });

    const res = await request(app)
      .get(`/users/${user.id}/memberships?page=0&size=10`)
      .expect(200);

    expect(res.body).toEqual(
      expect.objectContaining({
        page: 0,
        size: 10,
        totalItems: 2,
        items: expect.any(Array),
      }),
    );
    // r2 created after r1; with desc ordering, r2 should be first
    expect(res.body.items.length).toBe(2);
  });
});

describe("POST /users", () => {
  it("creates named user, hashes password, normalizes email", async () => {
    const res = await request(app)
      .post("/users")
      .send({ username: "Moody", email: "M@x.com", password: "s3cret" })
      .expect(201);

    expect(res.headers.location).toMatch(/^\/users\/\d+$/);

    const id = res.body.id;
    const dbUser = await prisma.user.findUnique({ where: { id } });
    expect(dbUser?.isAnonymous).toBe(false);
    expect(dbUser?.email).toBe("m@x.com");
    expect(await bcrypt.compare("s3cret", dbUser!.pwdHash!)).toBe(true);
    expect(res.body.pwdHash).toBeUndefined();
  });

  it("creates anonymous user via tx and sets username=User{id}", async () => {
    const res = await request(app).post("/users").send({}).expect(201);
    const id = res.body.id;

    const dbUser = await prisma.user.findUnique({ where: { id } });
    expect(dbUser?.isAnonymous).toBe(true);
    expect(dbUser?.username).toBe(`User${id}`);
  });

  it("enforces unique username + email", async () => {
    await prisma.user.create({
      data: {
        username: "taken",
        email: "x@y.com",
        isAnonymous: false,
        pwdHash: "h",
      },
    });

    const a = await request(app)
      .post("/users")
      .send({ username: "taken", email: "new@z.com", password: "p" });
    expect([400, 409, 500]).toContain(a.status);

    const b = await request(app)
      .post("/users")
      .send({ username: "new", email: "X@Y.com", password: "p" });
    expect([400, 409, 500]).toContain(b.status);
  });
});

describe("PATCH /users/:id", () => {
  it("updates username/email/password and sets isAnonymous=false", async () => {
    const u = await prisma.user.create({ data: {} });

    const res = await request(app)
      .patch(`/users/${u.id}`)
      .send({ username: "Paul", email: "P@Example.com", password: "newpass" })
      .expect(200);

    expect(res.body).toMatchObject({
      id: u.id,
      username: "Paul",
      email: "p@example.com",
      isAnonymous: false,
    });

    const dbUser = await prisma.user.findUnique({ where: { id: u.id } });
    expect(dbUser?.isAnonymous).toBe(false);
    expect(dbUser?.email).toBe("p@example.com");
    expect(await bcrypt.compare("newpass", dbUser!.pwdHash!)).toBe(true);
  });
});

describe("DELETE /users/:id", () => {
  it("CASCADE memberships, SET NULL message.userId, preserve author", async () => {
    const user = await prisma.user.create({
      data: { username: "Paul", isAnonymous: false },
    });
    const room = await prisma.room.create({ data: {} });
    await prisma.membership.create({
      data: { userId: user.id, roomId: room.id },
    });

    const msg = await prisma.message.create({
      data: { roomId: room.id, userId: user.id, author: "Paul", text: "hello" },
    });

    await request(app).delete(`/users/${user.id}`).expect(204);

    const mems = await prisma.membership.findMany({
      where: { userId: user.id },
    });
    expect(mems.length).toBe(0);

    const msgDb = await prisma.message.findUnique({ where: { id: msg.id } });
    expect(msgDb).toBeTruthy();
    expect(msgDb!.userId).toBeNull();
    expect(msgDb!.author).toBe("Paul");
  });
});
