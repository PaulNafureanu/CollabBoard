import request from "supertest";
import { makeApp } from "../../src/app";
import { prisma } from "../../src/db/prisma";

const app = makeApp();

describe("GET /messages/:id", () => {
  it("returns PublicMessage", async () => {
    const room = await prisma.room.create({ data: {} });
    const user = await prisma.user.create({
      data: { username: "Paul", isAnonymous: false },
    });
    const msg = await prisma.message.create({
      data: { roomId: room.id, userId: user.id, author: "Paul", text: "hello" },
    });

    const res = await request(app).get(`/messages/${msg.id}`).expect(200);
    expect(res.body).toEqual(
      expect.objectContaining({
        id: msg.id,
        roomId: room.id,
        userId: user.id,
        author: "Paul",
        text: "hello",
        createdAt: expect.any(String),
      }),
    );
  });

  it("404 when not found", async () => {
    await request(app).get(`/messages/999999`).expect(404);
  });
});

describe("POST /messages", () => {
  it("creates message, sets author=User{userId} when username is null", async () => {
    const room = await prisma.room.create({ data: {} });
    const anon = await prisma.user.create({ data: {} }); // username null

    const res = await request(app)
      .post("/messages")
      .send({ roomId: room.id, userId: anon.id, text: "hey" })
      .expect(201);

    expect(res.headers.location).toMatch(/^\/messages\/\d+$/);
    expect(res.body).toEqual(
      expect.objectContaining({
        roomId: room.id,
        userId: anon.id,
        text: "hey",
        author: `User${anon.id}`,
      }),
    );

    const dbMsg = await prisma.message.findUnique({
      where: { id: res.body.id },
    });
    expect(dbMsg!.author).toBe(`User${anon.id}`);
  });

  it("uses existing username as author when present", async () => {
    const room = await prisma.room.create({ data: {} });
    const user = await prisma.user.create({
      data: { username: "Moody", isAnonymous: false },
    });

    const res = await request(app).post("/messages").send({ roomId: room.id, userId: user.id, text: "hi" }).expect(201);

    expect(res.body.author).toBe("Moody");
  });

  it("409 on FK violation (nonexistent room or user)", async () => {
    const user = await prisma.user.create({ data: {} });
    await request(app).post("/messages").send({ roomId: 999999, userId: user.id, text: "x" }).expect(409);

    const room = await prisma.room.create({ data: {} });
    await request(app).post("/messages").send({ roomId: room.id, userId: 999999, text: "x" }).expect(404); // findFirstOrThrow on user triggers 404 before create
  });

  it("400 on invalid body (missing/empty text)", async () => {
    const room = await prisma.room.create({ data: {} });
    const user = await prisma.user.create({ data: {} });

    await request(app).post("/messages").send({ roomId: room.id, userId: user.id }).expect(400);

    await request(app).post("/messages").send({ roomId: room.id, userId: user.id, text: "   " }).expect(400);
  });

  it("400 on malformed JSON (if jsonParseGuard is mounted)", async () => {
    const room = await prisma.room.create({ data: {} });
    const user = await prisma.user.create({ data: {} });

    await request(app)
      .post("/messages")
      .set("Content-Type", "application/json")
      .send(`{"roomId":${room.id},"userId":${user.id},"text":"oops",}`)
      .expect(400);
  });
});

describe("PATCH /messages/:id", () => {
  it("updates text and returns PublicMessage", async () => {
    const room = await prisma.room.create({ data: {} });
    const user = await prisma.user.create({ data: {} });
    const msg = await prisma.message.create({
      data: {
        roomId: room.id,
        userId: user.id,
        author: `User${user.id}`,
        text: "before",
      },
    });

    const res = await request(app).patch(`/messages/${msg.id}`).send({ text: "after" }).expect(200);

    expect(res.body.text).toBe("after");
    const db = await prisma.message.findUnique({ where: { id: msg.id } });
    expect(db!.text).toBe("after");
  });

  it("400 on invalid text", async () => {
    const room = await prisma.room.create({ data: {} });
    const user = await prisma.user.create({ data: {} });
    const msg = await prisma.message.create({
      data: {
        roomId: room.id,
        userId: user.id,
        author: `User${user.id}`,
        text: "ok",
      },
    });

    await request(app).patch(`/messages/${msg.id}`).send({}).expect(400);
    await request(app).patch(`/messages/${msg.id}`).send({ text: "   " }).expect(400);
  });

  it("404 when message not found", async () => {
    await request(app).patch(`/messages/999999`).send({ text: "x" }).expect(404);
  });

  it("400 on malformed JSON (if jsonParseGuard is mounted)", async () => {
    const room = await prisma.room.create({ data: {} });
    const user = await prisma.user.create({ data: {} });
    const msg = await prisma.message.create({
      data: {
        roomId: room.id,
        userId: user.id,
        author: `User${user.id}`,
        text: "ok",
      },
    });

    await request(app)
      .patch(`/messages/${msg.id}`)
      .set("Content-Type", "application/json")
      .send('{"text":"nope",}')
      .expect(400);
  });
});

describe("DELETE /messages/:id", () => {
  it("204 and message is gone", async () => {
    const room = await prisma.room.create({ data: {} });
    const user = await prisma.user.create({ data: {} });
    const msg = await prisma.message.create({
      data: {
        roomId: room.id,
        userId: user.id,
        author: `User${user.id}`,
        text: "bye",
      },
    });

    await request(app).delete(`/messages/${msg.id}`).expect(204);
    await request(app).get(`/messages/${msg.id}`).expect(404);
  });

  it("404 when message not found", async () => {
    await request(app).delete(`/messages/999999`).expect(404);
  });
});

// (Optional) invariants: user deletion preserves message with author, nulls userId
describe("Messages invariants on user deletion", () => {
  it("deleting user nulls message.userId and keeps author", async () => {
    const room = await prisma.room.create({ data: {} });
    const user = await prisma.user.create({
      data: { username: "Paul", isAnonymous: false },
    });

    const msg = await prisma.message.create({
      data: { roomId: room.id, userId: user.id, author: "Paul", text: "hello" },
    });

    await prisma.user.delete({ where: { id: user.id } });

    const msgDb = await prisma.message.findUnique({ where: { id: msg.id } });
    expect(msgDb).toBeTruthy();
    expect(msgDb!.userId).toBeNull();
    expect(msgDb!.author).toBe("Paul");
  });
});
