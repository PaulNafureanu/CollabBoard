import request from "supertest";
import { makeApp } from "../../src/app";
import { prisma } from "../../src/db/prisma";

const app = makeApp();

describe("GET /memberships/:id", () => {
  it("returns PublicMembership", async () => {
    const u = await prisma.user.create({ data: {} });
    const r = await prisma.room.create({ data: {} });
    const m = await prisma.membership.create({
      data: { userId: u.id, roomId: r.id },
    });

    const res = await request(app).get(`/memberships/${m.id}`).expect(200);

    expect(res.body).toEqual(
      expect.objectContaining({
        id: m.id,
        userId: u.id,
        roomId: r.id,
        role: "MEMBER",
        joinedAt: expect.any(String),
      }),
    );
  });

  it("404 when not found", async () => {
    await request(app).get(`/memberships/999999`).expect(404);
  });
});

describe("POST /memberships", () => {
  it("creates membership with default role MEMBER", async () => {
    const u = await prisma.user.create({ data: {} });
    const r = await prisma.room.create({ data: {} });

    const res = await request(app)
      .post("/memberships")
      .send({ userId: u.id, roomId: r.id })
      .expect(201);

    expect(res.headers.location).toMatch(/^\/memberships\/\d+$/);
    const db = await prisma.membership.findUnique({
      where: { id: res.body.id },
    });
    expect(db).toBeTruthy();
    expect(db!.role).toBe("MEMBER");
  });

  it("accepts role case-insensitively and stores enum (e.g., moderator -> MODERATOR)", async () => {
    const u = await prisma.user.create({ data: {} });
    const r = await prisma.room.create({ data: {} });

    const res = await request(app)
      .post("/memberships")
      .send({ userId: u.id, roomId: r.id, role: "moderator" })
      .expect(201);

    expect(res.body.role).toBe("MODERATOR");
  });

  it("409 on duplicate (unique userId+roomId)", async () => {
    const u = await prisma.user.create({ data: {} });
    const r = await prisma.room.create({ data: {} });
    await prisma.membership.create({ data: { userId: u.id, roomId: r.id } });

    await request(app)
      .post("/memberships")
      .send({ userId: u.id, roomId: r.id })
      .expect(409);
  });

  it("409 on foreign key violation (nonexistent user/room)", async () => {
    // user exists, room doesn't
    const u = await prisma.user.create({ data: {} });
    await request(app)
      .post("/memberships")
      .send({ userId: u.id, roomId: 999999 })
      .expect(409);

    // room exists, user doesn't
    const r = await prisma.room.create({ data: {} });
    await request(app)
      .post("/memberships")
      .send({ userId: 999999, roomId: r.id })
      .expect(409);
  });

  it("400 on invalid body (missing fields / invalid role)", async () => {
    await request(app).post("/memberships").send({}).expect(400);

    const u = await prisma.user.create({ data: {} });
    const r = await prisma.room.create({ data: {} });
    await request(app)
      .post("/memberships")
      .send({ userId: u.id, roomId: r.id, role: "notarole" })
      .expect(400);
  });

  it("400 on malformed JSON (if jsonParseGuard mounted)", async () => {
    const u = await prisma.user.create({ data: {} });
    const r = await prisma.room.create({ data: {} });
    await request(app)
      .post("/memberships")
      .set("Content-Type", "application/json")
      .send(`{"userId":${u.id},"roomId":${r.id},"role":"member",}`)
      .expect(400);
  });
});

describe("PATCH /memberships/:id", () => {
  it("updates role (case-insensitive) and returns PublicMembership", async () => {
    const u = await prisma.user.create({ data: {} });
    const r = await prisma.room.create({ data: {} });
    const m = await prisma.membership.create({
      data: { userId: u.id, roomId: r.id },
    });

    const res = await request(app)
      .patch(`/memberships/${m.id}`)
      .send({ role: "owner" })
      .expect(200);

    expect(res.body.role).toBe("OWNER");

    const db = await prisma.membership.findUnique({ where: { id: m.id } });
    expect(db!.role).toBe("OWNER");
  });

  it("400 on invalid role", async () => {
    const u = await prisma.user.create({ data: {} });
    const r = await prisma.room.create({ data: {} });
    const m = await prisma.membership.create({
      data: { userId: u.id, roomId: r.id },
    });

    await request(app)
      .patch(`/memberships/${m.id}`)
      .send({ role: "nope" })
      .expect(400);
  });

  it("404 when membership not found", async () => {
    await request(app)
      .patch(`/memberships/999999`)
      .send({ role: "MODERATOR" })
      .expect(404);
  });

  it("400 on malformed JSON (if jsonParseGuard mounted)", async () => {
    const u = await prisma.user.create({ data: {} });
    const r = await prisma.room.create({ data: {} });
    const m = await prisma.membership.create({
      data: { userId: u.id, roomId: r.id },
    });

    await request(app)
      .patch(`/memberships/${m.id}`)
      .set("Content-Type", "application/json")
      .send('{"role":"member",}')
      .expect(400);
  });
});

describe("DELETE /memberships/:id", () => {
  it("204 and membership is gone", async () => {
    const u = await prisma.user.create({ data: {} });
    const r = await prisma.room.create({ data: {} });
    const m = await prisma.membership.create({
      data: { userId: u.id, roomId: r.id },
    });

    await request(app).delete(`/memberships/${m.id}`).expect(204);
    await request(app).get(`/memberships/${m.id}`).expect(404);
  });

  it("404 when membership not found", async () => {
    await request(app).delete(`/memberships/999999`).expect(404);
  });
});
