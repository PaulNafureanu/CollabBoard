// server/tests/integration/users.int.test.ts
import request from "supertest";
import * as bcrypt from "bcrypt";
import { makeApp } from "../../src/app";
import { prisma } from "../../src/db/prisma";

const app = makeApp();

describe("GET /users/:id", () => {
  it("returns PublicUser and never leaks pwdHash", async () => {
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
    expect(typeof res.body.createdAt).toBe("string");
    expect(res.body.pwdHash).toBeUndefined();
  });

  it("404 when user not found", async () => {
    await request(app).get(`/users/999999`).expect(404);
  });
});

describe("GET /users/:id/memberships", () => {
  it("returns paginated memberships ordered by joinedAt desc, id desc", async () => {
    const user = await prisma.user.create({ data: {} });
    const r1 = await prisma.room.create({ data: {} });
    const r2 = await prisma.room.create({ data: {} });

    // create in r1 then r2 -> expect r2 first due to desc ordering
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
        totalPages: 1,
        hasNext: false,
        hasPrev: false,
      }),
    );
    expect(res.body.items.length).toBe(2);

    // PublicMembership shape
    for (const m of res.body.items) {
      expect(m).toEqual(
        expect.objectContaining({
          id: expect.any(Number),
          userId: user.id,
          roomId: expect.any(Number),
          role: "MEMBER",
          joinedAt: expect.any(String),
        }),
      );
    }

    // strict order: r2 first, then r1
    expect(res.body.items.map((m: any) => m.roomId)).toEqual([r2.id, r1.id]);
  });

  it("400 when pagination query invalid", async () => {
    // size < 1 violates your zod (min 1)
    await request(app).get(`/users/1/memberships?page=0&size=0`).expect(400);
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

  it("409 on unique username and email", async () => {
    await prisma.user.create({
      data: {
        username: "taken",
        email: "x@y.com",
        isAnonymous: false,
        pwdHash: "h",
      },
    });

    await request(app)
      .post("/users")
      .send({ username: "taken", email: "new@z.com", password: "p12345678" })
      .expect(409);

    await request(app)
      .post("/users")
      .send({ username: "new", email: "X@Y.com", password: "p12345678" })
      .expect(409);
  });

  it("400 on bad named payload (missing password)", async () => {
    await request(app)
      .post("/users")
      .send({ username: "NoPw", email: "a@b.com" })
      .expect(400);
  });

  it("400 on malformed JSON (requires jsonParseGuard mounted)", async () => {
    await request(app)
      .post("/users")
      .set("Content-Type", "application/json")
      .send('{"username":"x",}') // trailing comma -> invalid JSON
      .expect(400);
  });
});

describe("PATCH /users/:id", () => {
  it("updates username/email/password and flips isAnonymous=false", async () => {
    const u = await prisma.user.create({ data: {} });

    const res = await request(app)
      .patch(`/users/${u.id}`)
      .send({
        username: "Paul",
        email: "P@Example.com",
        password: "newpass123",
      })
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
    expect(await bcrypt.compare("newpass123", dbUser!.pwdHash!)).toBe(true);
  });

  it("409 when updating to a duplicate username", async () => {
    const u1 = await prisma.user.create({
      data: {
        username: "first",
        email: "a@a.com",
        isAnonymous: false,
        pwdHash: "h",
      },
    });
    const u2 = await prisma.user.create({
      data: {
        username: "second",
        email: "b@b.com",
        isAnonymous: false,
        pwdHash: "h2",
      },
    });

    await request(app)
      .patch(`/users/${u2.id}`)
      .send({ username: "first" })
      .expect(409);
    // also verify no partial changes persisted
    const still = await prisma.user.findUnique({ where: { id: u2.id } });
    expect(still?.username).toBe("second");
  });

  it("400 on empty body (UpdateBody refine)", async () => {
    await request(app).patch(`/users/123`).send({}).expect(400);
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

    expect(await prisma.membership.count({ where: { userId: user.id } })).toBe(
      0,
    );

    const msgDb = await prisma.message.findUnique({ where: { id: msg.id } });
    expect(msgDb).toBeTruthy();
    expect(msgDb!.userId).toBeNull();
    expect(msgDb!.author).toBe("Paul");
  });

  it("404 when deleting missing user", async () => {
    await request(app).delete(`/users/999999`).expect(404);
  });
});
