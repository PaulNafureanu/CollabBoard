import request from "supertest";
import { makeApp } from "../../src/app";
import { prisma } from "../../src/db/prisma";

const app = makeApp();

describe("GET /boardstates/:id", () => {
  it("returns PublicBoardState", async () => {
    const room = await prisma.room.create({ data: {} });
    const bRes = await request(app).post("/boards").send({ roomId: room.id }).expect(201);
    const boardId = bRes.body.id;

    const sRes = await request(app)
      .post("/boardstates")
      .send({ boardId, version: 2, payload: { a: 1 } })
      .expect(201);

    const stateId = sRes.body.id;

    const res = await request(app).get(`/boardstates/${stateId}`).expect(200);
    expect(res.body).toEqual(
      expect.objectContaining({
        id: stateId,
        boardId,
        version: 2,
        payload: { a: 1 },
        createdAt: expect.any(String),
      }),
    );
  });

  it("404 when not found", async () => {
    await request(app).get(`/boardstates/999999`).expect(404);
  });
});

describe("POST /boardstates", () => {
  it("creates a new state with given version + payload, and sets it active for the room (board.lastState unchanged by design)", async () => {
    const room = await prisma.room.create({ data: {} });

    // create initial board via route (creates v1 and sets room.active)
    const bRes = await request(app).post("/boards").send({ roomId: room.id }).expect(201);
    const boardId = bRes.body.id;

    const beforeBoard = await prisma.board.findUnique({
      where: { id: boardId },
    });
    const beforeLastState = beforeBoard!.lastState;

    // create v2 via route
    const s2 = await request(app)
      .post("/boardstates")
      .send({ boardId, version: 2, payload: { step: 2 } })
      .expect(201);

    // room active should now be v2
    const roomAfter = await prisma.room.findUnique({ where: { id: room.id } });
    expect(roomAfter!.activeBoardStateId).toBe(s2.body.id);

    // board.lastState remains whatever it was (design of createBoardState)
    const boardAfter = await prisma.board.findUnique({
      where: { id: boardId },
    });
    expect(boardAfter!.lastState).toBe(beforeLastState);

    // create v3 and verify room active follows latest state
    const s3 = await request(app)
      .post("/boardstates")
      .send({ boardId, version: 3, payload: { step: 3 } })
      .expect(201);

    const roomAfter3 = await prisma.room.findUnique({ where: { id: room.id } });
    expect(roomAfter3!.activeBoardStateId).toBe(s3.body.id);

    // payload and version persisted
    const s3Db = await prisma.boardState.findUnique({
      where: { id: s3.body.id },
    });
    expect(s3Db).toMatchObject({ version: 3, payload: { step: 3 } });
  });

  it("400 on malformed JSON (if jsonParseGuard is mounted)", async () => {
    const room = await prisma.room.create({ data: {} });
    const bRes = await request(app).post("/boards").send({ roomId: room.id }).expect(201);
    const boardId = bRes.body.id;

    await request(app)
      .post("/boardstates")
      .set("Content-Type", "application/json")
      .send(`{"boardId":${boardId},"version":2,"payload":{ "x": 1 },}`)
      .expect(400);
  });

  it("400 on invalid body (missing fields)", async () => {
    await request(app).post("/boardstates").send({}).expect(400);
  });

  it("404 when boardId does not exist", async () => {
    await request(app).post("/boardstates").send({ boardId: 999999, version: 2, payload: {} }).expect(404);
  });
});

describe("DELETE /boardstates/:id", () => {
  it("deletes the target and all newer (>= version) states, re-points board.lastState and room active to the previous version", async () => {
    const room = await prisma.room.create({ data: {} });
    const bRes = await request(app).post("/boards").send({ roomId: room.id }).expect(201);
    const boardId = bRes.body.id;

    // add v2, v3 via route
    const s2 = await request(app)
      .post("/boardstates")
      .send({ boardId, version: 2, payload: { step: 2 } })
      .expect(201);
    const s3 = await request(app)
      .post("/boardstates")
      .send({ boardId, version: 3, payload: { step: 3 } })
      .expect(201);

    // delete v3 -> should remove only v3; last/active -> v2
    await request(app).delete(`/boardstates/${s3.body.id}`).expect(204);

    const statesAfter3 = await prisma.boardState.findMany({
      where: { boardId },
      orderBy: { version: "asc" },
    });
    expect(statesAfter3.map((s) => s.version)).toEqual([1, 2]);

    const boardAfter3 = await prisma.board.findUnique({
      where: { id: boardId },
    });
    const roomAfter3 = await prisma.room.findUnique({ where: { id: room.id } });

    expect(boardAfter3!.lastState).toBe(s2.body.id);
    expect(roomAfter3!.activeBoardStateId).toBe(s2.body.id);

    // delete v2 -> should remove v2; last/active -> v1
    await request(app).delete(`/boardstates/${s2.body.id}`).expect(204);

    const statesAfter2 = await prisma.boardState.findMany({
      where: { boardId },
      orderBy: { version: "asc" },
    });
    expect(statesAfter2.map((s) => s.version)).toEqual([1]);

    const v1 = statesAfter2[0];
    const boardAfter2 = await prisma.board.findUnique({
      where: { id: boardId },
    });
    const roomAfter2 = await prisma.room.findUnique({ where: { id: room.id } });

    expect(boardAfter2!.lastState).toBe(v1.id);
    expect(roomAfter2!.activeBoardStateId).toBe(v1.id);
  });

  it("when deleting v1 and it’s the last state: recreates a fresh v1 with default payload and points board/room to it", async () => {
    const room = await prisma.room.create({ data: {} });
    const bRes = await request(app).post("/boards").send({ roomId: room.id }).expect(201);
    const boardId = bRes.body.id;

    // There is only v1 now (created by /boards route)
    const [v1] = await prisma.boardState.findMany({
      where: { boardId },
      orderBy: { version: "asc" },
    });
    expect(v1.version).toBe(1);

    // delete v1 -> route should delete >=1 (all), then create a new v1
    await request(app).delete(`/boardstates/${v1.id}`).expect(204);

    const states = await prisma.boardState.findMany({
      where: { boardId },
      orderBy: { version: "asc" },
    });
    expect(states.length).toBe(1);
    const newV1 = states[0];
    expect(newV1.version).toBe(1);
    expect(newV1.id).not.toBe(v1.id); // fresh record

    const boardDb = await prisma.board.findUnique({ where: { id: boardId } });
    const roomDb = await prisma.room.findUnique({ where: { id: room.id } });
    expect(boardDb!.lastState).toBe(newV1.id);
    expect(roomDb!.activeBoardStateId).toBe(newV1.id);
  });

  it("404 when state not found", async () => {
    await request(app).delete(`/boardstates/999999`).expect(404);
  });
});
