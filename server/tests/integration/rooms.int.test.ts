import request from "supertest";
import { makeApp } from "../../src/app";
import { prisma } from "../../src/db/prisma";

const app = makeApp();

describe("GET /rooms/:id", () => {
  it("returns PublicRoom", async () => {
    const room = await prisma.room.create({ data: {} });

    const res = await request(app).get(`/rooms/${room.id}`).expect(200);

    expect(res.body).toMatchObject({
      id: room.id,
      slug: null,
      activeBoardStateId: null,
    });
    expect(typeof res.body.createdAt).toBe("string");
    expect(typeof res.body.updatedAt).toBe("string");
  });

  it("404 when not found", async () => {
    await request(app).get(`/rooms/999999`).expect(404);
  });
});

describe("GET /rooms/:id/memberships", () => {
  it("paginates memberships ordered by joinedAt desc, id desc", async () => {
    const room = await prisma.room.create({ data: {} });
    const u1 = await prisma.user.create({ data: {} });
    const u2 = await prisma.user.create({ data: {} });

    // create in order; expect u2 last created to appear first (desc)
    const m1 = await prisma.membership.create({
      data: { userId: u1.id, roomId: room.id },
    });
    const m2 = await prisma.membership.create({
      data: { userId: u2.id, roomId: room.id },
    });

    const res = await request(app)
      .get(`/rooms/${room.id}/memberships?page=0&size=10`)
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

    for (const it of res.body.items) {
      expect(it).toEqual(
        expect.objectContaining({
          id: expect.any(Number),
          userId: expect.any(Number),
          roomId: room.id,
          role: "MEMBER",
          joinedAt: expect.any(String),
        }),
      );
    }

    // desc by joinedAt then id -> m2 then m1
    expect(res.body.items.map((m: any) => m.id)).toEqual([m2.id, m1.id]);
  });

  it("400 on invalid pagination", async () => {
    const room = await prisma.room.create({ data: {} });
    await request(app)
      .get(`/rooms/${room.id}/memberships?page=0&size=0`)
      .expect(400);
  });
});

describe("GET /rooms/:id/messages", () => {
  it("paginates messages ordered by createdAt desc, id desc", async () => {
    const room = await prisma.room.create({ data: {} });
    const u = await prisma.user.create({
      data: { username: "Paul", isAnonymous: false },
    });

    const msg1 = await prisma.message.create({
      data: { roomId: room.id, userId: u.id, author: "Paul", text: "a" },
    });
    const msg2 = await prisma.message.create({
      data: { roomId: room.id, userId: u.id, author: "Paul", text: "b" },
    });

    const res = await request(app)
      .get(`/rooms/${room.id}/messages?page=0&size=10`)
      .expect(200);

    expect(res.body.totalItems).toBe(2);
    expect(res.body.items.map((m: any) => m.id)).toEqual([msg2.id, msg1.id]);

    const first = res.body.items[0];
    expect(first).toEqual(
      expect.objectContaining({
        id: msg2.id,
        roomId: room.id,
        userId: u.id,
        author: "Paul",
        text: "b",
        createdAt: expect.any(String),
      }),
    );
  });
});

describe("GET /rooms/:id/boards", () => {
  it("paginates boards ordered by updatedAt desc, id desc", async () => {
    const room = await prisma.room.create({ data: {} });

    const b1 = await prisma.board.create({ data: { roomId: room.id } });
    // touch b1 to ensure updatedAt diff if needed
    const b2 = await prisma.board.create({ data: { roomId: room.id } });

    const res = await request(app)
      .get(`/rooms/${room.id}/boards?page=0&size=10`)
      .expect(200);

    expect(res.body.totalItems).toBe(2);
    // newer board first
    expect(res.body.items.map((b: any) => b.id)).toEqual([b2.id, b1.id]);

    const shape = res.body.items[0];
    expect(shape).toEqual(
      expect.objectContaining({
        id: expect.any(Number),
        roomId: room.id,
        lastState: null, // unless you later set it
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      }),
    );
  });
});

describe("POST /rooms", () => {
  it("creates room with explicit slug, and creates initial board + boardstate + sets activeBoardStateId", async () => {
    const res = await request(app)
      .post("/rooms")
      .send({ slug: "alpha" })
      .expect(201);

    expect(res.headers.location).toMatch(/^\/rooms\/\d+$/);
    const id = res.body.id;

    // room returned must include the activeBoardStateId set by createBoard()
    expect(res.body.slug).toBe("alpha");
    expect(typeof res.body.activeBoardStateId).toBe("number");

    const roomDb = await prisma.room.findUnique({ where: { id } });
    expect(roomDb?.slug).toBe("alpha");
    expect(roomDb?.activeBoardStateId).toBe(res.body.activeBoardStateId);

    // Exactly one board and one boardstate linked correctly
    const boards = await prisma.board.findMany({ where: { roomId: id } });
    expect(boards.length).toBe(1);

    const states = await prisma.boardState.findMany({
      where: { boardId: boards[0].id },
    });
    expect(states.length).toBe(1);

    expect(boards[0].lastState).toBe(states[0].id);
    expect(roomDb?.activeBoardStateId).toBe(states[0].id);
  });

  it("creates room with auto slug Room{id} when no slug provided, plus board/state/active", async () => {
    const res = await request(app).post("/rooms").send({}).expect(201);
    const id = res.body.id;

    expect(res.body.slug).toBe(`Room${id}`);
    expect(typeof res.body.activeBoardStateId).toBe("number");

    const boards = await prisma.board.findMany({ where: { roomId: id } });
    const states = await prisma.boardState.findMany({
      where: { boardId: boards[0].id },
    });
    expect(boards.length).toBe(1);
    expect(states.length).toBe(1);
    expect(boards[0].lastState).toBe(states[0].id);
  });

  it("409 on duplicate slug", async () => {
    await prisma.room.create({ data: { slug: "dup" } });
    await request(app).post("/rooms").send({ slug: "dup" }).expect(409);
  });

  it("400 on malformed JSON (requires jsonParseGuard)", async () => {
    await request(app)
      .post("/rooms")
      .set("Content-Type", "application/json")
      .send('{"slug":"oops",}')
      .expect(400);
  });
});

describe("PATCH /rooms/:id", () => {
  it("updates slug", async () => {
    const room = await prisma.room.create({ data: { slug: "before" } });

    const res = await request(app)
      .patch(`/rooms/${room.id}`)
      .send({ slug: "after" })
      .expect(200);

    expect(res.body.slug).toBe("after");
    const db = await prisma.room.findUnique({ where: { id: room.id } });
    expect(db?.slug).toBe("after");
  });

  it("updates activeBoardStateId to another existing state", async () => {
    // create a room via route so it has initial board + state + active set
    const created = await request(app)
      .post("/rooms")
      .send({ slug: "switchable" })
      .expect(201);
    const roomId = created.body.id;
    const initialActive = created.body.activeBoardStateId;

    // create another board + state for the same room (direct via prisma)
    const board2 = await prisma.board.create({ data: { roomId } });
    const state2 = await prisma.boardState.create({
      data: { boardId: board2.id, payload: {} },
    });

    // patch to switch active state
    const res = await request(app)
      .patch(`/rooms/${roomId}`)
      .send({ activeBoardStateId: state2.id })
      .expect(200);

    expect(res.body.activeBoardStateId).toBe(state2.id);
    expect(res.body.activeBoardStateId).not.toBe(initialActive);

    const db = await prisma.room.findUnique({ where: { id: roomId } });
    expect(db?.activeBoardStateId).toBe(state2.id);
  });

  it("409 on duplicate slug", async () => {
    const r1 = await prisma.room.create({ data: { slug: "one" } });
    const r2 = await prisma.room.create({ data: { slug: "two" } });

    await request(app)
      .patch(`/rooms/${r2.id}`)
      .send({ slug: "one" })
      .expect(409);
  });

  it("400 on empty body (UpdateBody refine)", async () => {
    const r = await prisma.room.create({ data: {} });
    await request(app).patch(`/rooms/${r.id}`).send({}).expect(400);
  });

  it("404 on missing room", async () => {
    await request(app).patch(`/rooms/999999`).send({ slug: "x" }).expect(404);
  });
});

describe("DELETE /rooms/:id", () => {
  it("cascades memberships, messages, boards, and boardstates", async () => {
    // make a room with initial board/state via route (so active is set)
    const created = await request(app)
      .post("/rooms")
      .send({ slug: "to-delete" })
      .expect(201);
    const roomId = created.body.id;

    const user = await prisma.user.create({
      data: { username: "Paul", isAnonymous: false },
    });
    await prisma.membership.create({ data: { userId: user.id, roomId } });
    await prisma.message.create({
      data: { roomId, userId: user.id, author: "Paul", text: "hi" },
    });

    // also add an extra board + state
    const b2 = await prisma.board.create({ data: { roomId } });
    await prisma.boardState.create({ data: { boardId: b2.id, payload: {} } });

    await request(app).delete(`/rooms/${roomId}`).expect(204);

    // everything for that room should be gone
    expect(await prisma.room.findUnique({ where: { id: roomId } })).toBeNull();
    expect(await prisma.membership.count({ where: { roomId } })).toBe(0);
    expect(await prisma.message.count({ where: { roomId } })).toBe(0);
    expect(await prisma.board.count({ where: { roomId } })).toBe(0);

    // boardstates linked via boards should also be gone
    const orphanStates = await prisma.boardState.findMany({
      where: { board: { roomId } },
    });
    expect(orphanStates.length).toBe(0);
  });

  it("404 when room not found", async () => {
    await request(app).delete(`/rooms/999999`).expect(404);
  });
});
