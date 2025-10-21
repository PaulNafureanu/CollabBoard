import request from "supertest";
import { makeApp } from "../../src/app";
import { prisma } from "../../src/db/prisma";

const app = makeApp();

describe("GET /boards/:id", () => {
  it("returns PublicBoard", async () => {
    const room = await prisma.room.create({ data: {} });
    const board = await prisma.board.create({ data: { roomId: room.id } });

    const res = await request(app).get(`/boards/${board.id}`).expect(200);

    expect(res.body).toEqual(
      expect.objectContaining({
        id: board.id,
        roomId: room.id,
        lastState: null,
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      }),
    );
  });

  it("404 when not found", async () => {
    await request(app).get(`/boards/999999`).expect(404);
  });
});

describe("GET /boards/:id/boardstates", () => {
  it("paginates board states ordered by version desc, id desc", async () => {
    const room = await prisma.room.create({ data: {} });

    // Create a board via route to ensure initial state + active set
    const created = await request(app)
      .post("/boards")
      .send({ roomId: room.id })
      .expect(201);
    const boardId = created.body.id;

    // Add two more states with versions 2 and 3
    const s2 = await prisma.boardState.create({
      data: { boardId, version: 2, payload: {} },
    });
    const s3 = await prisma.boardState.create({
      data: { boardId, version: 3, payload: {} },
    });
    // Point board.lastState at v3
    await prisma.board.update({
      where: { id: boardId },
      data: { lastState: s3.id },
    });

    const res = await request(app)
      .get(`/boards/${boardId}/boardstates?page=0&size=10`)
      .expect(200);

    expect(res.body.totalItems).toBe(3);
    // order: v3, v2, v1
    const versions = res.body.items.map((st: any) => st.version);
    expect(versions).toEqual([3, 2, 1]);

    const first = res.body.items[0];
    expect(first).toEqual(
      expect.objectContaining({
        id: s3.id,
        boardId,
        version: 3,
        payload: expect.anything(),
        createdAt: expect.any(String),
      }),
    );
  });

  it("400 on invalid pagination", async () => {
    const room = await prisma.room.create({ data: {} });
    const b = await prisma.board.create({ data: { roomId: room.id } });
    await request(app)
      .get(`/boards/${b.id}/boardstates?page=0&size=0`)
      .expect(400);
  });
});

describe("POST /boards", () => {
  it("creates a board for a room, adds initial state (v1), sets board.lastState, and makes it active for the room", async () => {
    const room = await prisma.room.create({ data: {} });

    const res = await request(app)
      .post("/boards")
      .send({ roomId: room.id })
      .expect(201);
    expect(res.headers.location).toMatch(/^\/boards\/\d+$/);

    const boardId = res.body.id;

    // Board exists
    const boardDb = await prisma.board.findUnique({ where: { id: boardId } });
    expect(boardDb).toBeTruthy();
    expect(boardDb!.roomId).toBe(room.id);
    expect(typeof boardDb!.lastState).toBe("number");

    // Single state v1 created
    const states = await prisma.boardState.findMany({ where: { boardId } });
    expect(states.length).toBe(1);
    expect(states[0].version).toBe(1);

    // Room active points to that state
    const roomDb = await prisma.room.findUnique({ where: { id: room.id } });
    expect(roomDb!.activeBoardStateId).toBe(states[0].id);
  });

  it("400 on malformed JSON (if jsonParseGuard is mounted)", async () => {
    const room = await prisma.room.create({ data: {} });
    await request(app)
      .post("/boards")
      .set("Content-Type", "application/json")
      .send(`{"roomId":${room.id},}`)
      .expect(400);
  });

  it("400 on missing roomId (Zod)", async () => {
    await request(app).post("/boards").send({}).expect(400);
  });
});

describe("PATCH /boards/:id (move/copy)", () => {
  it("moves a board to another room; sender room gets a valid active state, receiver active becomes moved board.lastState", async () => {
    // Sender room with one board created via route (so it has state v1 and active set)
    const senderCreated = await request(app)
      .post("/boards")
      .send({ roomId: (await prisma.room.create({ data: {} })).id })
      .expect(201);
    const boardId = senderCreated.body.id;
    const senderRoomId = senderCreated.body.roomId;

    // Make sender have a second board too, so getActivatedRoom can pick previous if needed
    const extraBoard = await request(app)
      .post("/boards")
      .send({ roomId: senderRoomId })
      .expect(201);

    // Receiver room with at least one board
    const receiverRoom = await prisma.room.create({ data: {} });
    await request(app)
      .post("/boards")
      .send({ roomId: receiverRoom.id })
      .expect(201);

    // Capture sender's active before move
    const beforeSender = await prisma.room.findUnique({
      where: { id: senderRoomId },
    });
    const movedBoard = await prisma.board.findUnique({
      where: { id: boardId },
    });
    const movedLast = movedBoard!.lastState;

    const res = await request(app)
      .patch(`/boards/${boardId}`)
      .query({ copy: false })
      .send({ roomId: receiverRoom.id })
      .expect(200);

    // Board now belongs to receiver
    expect(res.body.roomId).toBe(receiverRoom.id);

    const afterSender = await prisma.room.findUnique({
      where: { id: senderRoomId },
    });
    const afterReceiver = await prisma.room.findUnique({
      where: { id: receiverRoom.id },
    });

    // Receiver active is the moved board last state
    expect(afterReceiver!.activeBoardStateId).toBe(movedLast);

    // Sender active is still valid and NOT the moved board's state
    expect(afterSender!.activeBoardStateId).not.toBe(movedLast);
    // The active state in sender should belong to some board in the sender room
    const senderBoards = await prisma.board.findMany({
      where: { roomId: senderRoomId },
    });
    const senderBoardStateIds = await prisma.boardState.findMany({
      where: { boardId: { in: senderBoards.map((b) => b.id) } },
      select: { id: true },
    });
    const senderStateIdSet = new Set(senderBoardStateIds.map((s) => s.id));
    expect(senderStateIdSet.has(afterSender!.activeBoardStateId!)).toBe(true);
  });

  it("copies a board into another room; new board with cloned states; receiver active becomes the new board's last state; original untouched", async () => {
    // Original room with a multi-state board
    const originRoom = await prisma.room.create({ data: {} });
    const originRes = await request(app)
      .post("/boards")
      .send({ roomId: originRoom.id })
      .expect(201);
    const originBoardId = originRes.body.id;

    // Add two more versions 2,3 to the origin board
    const v2 = await prisma.boardState.create({
      data: { boardId: originBoardId, version: 2, payload: { a: 1 } },
    });
    const v3 = await prisma.boardState.create({
      data: { boardId: originBoardId, version: 3, payload: { b: 2 } },
    });
    await prisma.board.update({
      where: { id: originBoardId },
      data: { lastState: v3.id },
    });

    // Receiver room with some content already
    const receiverRoom = await prisma.room.create({ data: {} });
    const receiverInitial = await request(app)
      .post("/boards")
      .send({ roomId: receiverRoom.id })
      .expect(201);

    const res = await request(app)
      .patch(`/boards/${originBoardId}`)
      .query({ copy: true })
      .send({ roomId: receiverRoom.id })
      .expect(200);

    const newBoardId = res.body.id;
    expect(newBoardId).not.toBe(originBoardId);
    expect(res.body.roomId).toBe(receiverRoom.id);

    // New board has cloned states with same versions (1,2,3)
    const newStates = await prisma.boardState.findMany({
      where: { boardId: newBoardId },
      orderBy: { version: "asc" },
    });
    expect(newStates.map((s) => s.version)).toEqual([1, 2, 3]);

    // Receiver active points to the last of the new board
    const receiverDb = await prisma.room.findUnique({
      where: { id: receiverRoom.id },
    });
    expect(receiverDb!.activeBoardStateId).toBe(
      newStates[newStates.length - 1].id,
    );

    // Original board remains in original room with its lastState unchanged
    const originBoard = await prisma.board.findUnique({
      where: { id: originBoardId },
    });
    expect(originBoard!.roomId).toBe(originRoom.id);
    expect(originBoard!.lastState).toBe(v3.id);
  });

  it("400 on missing roomId (Zod)", async () => {
    const room = await prisma.room.create({ data: {} });
    const b = await request(app)
      .post("/boards")
      .send({ roomId: room.id })
      .expect(201);
    await request(app).patch(`/boards/${b.body.id}`).send({}).expect(400);
  });

  it("404 when board not found", async () => {
    const receiver = await prisma.room.create({ data: {} });
    await request(app)
      .patch(`/boards/999999`)
      .query({ copy: false })
      .send({ roomId: receiver.id })
      .expect(404);
  });
});

describe("DELETE /boards/:id", () => {
  it("deleting the only board in a room: handler creates a replacement board+state, then deletes the original", async () => {
    const room = await prisma.room.create({ data: {} });

    // Create exactly one board via route => board + state v1 + room.active set
    const only = await request(app)
      .post("/boards")
      .send({ roomId: room.id })
      .expect(201);
    const onlyBoardId = only.body.id;

    // Delete it
    await request(app).delete(`/boards/${onlyBoardId}`).expect(204);

    // The room should now still have exactly one board (replacement)
    const boards = await prisma.board.findMany({ where: { roomId: room.id } });
    expect(boards.length).toBe(1);
    expect(boards[0].id).not.toBe(onlyBoardId);

    // And one state for that board, active on the room
    const states = await prisma.boardState.findMany({
      where: { boardId: boards[0].id },
    });
    expect(states.length).toBe(1);

    const roomDb = await prisma.room.findUnique({ where: { id: room.id } });
    expect(roomDb!.activeBoardStateId).toBe(states[0].id);
  });

  it("deleting a board when multiple exist: if the deleted board was active, active switches to a previous board", async () => {
    const room = await prisma.room.create({ data: {} });

    // Create b1 (active on room)
    const b1 = await request(app)
      .post("/boards")
      .send({ roomId: room.id })
      .expect(201);
    const b1Id = b1.body.id;

    // Create b2 (this will become active)
    const b2 = await request(app)
      .post("/boards")
      .send({ roomId: room.id })
      .expect(201);
    const b2Id = b2.body.id;

    // Delete b2 (currently active)
    await request(app).delete(`/boards/${b2Id}`).expect(204);

    // Room should still exist and have at least one board (b1)
    const roomDb = await prisma.room.findUnique({ where: { id: room.id } });
    const boards = await prisma.board.findMany({ where: { roomId: room.id } });
    expect(roomDb).toBeTruthy();
    expect(boards.map((b) => b.id)).toContain(b1Id);
    expect(boards.map((b) => b.id)).not.toContain(b2Id);

    // Room active must now be some state from remaining boards (b1)
    const b1States = await prisma.boardState.findMany({
      where: { boardId: b1Id },
      select: { id: true },
    });
    const b1StateIdSet = new Set(b1States.map((s) => s.id));
    expect(b1StateIdSet.has(roomDb!.activeBoardStateId!)).toBe(true);
  });

  it("404 when board not found", async () => {
    await request(app).delete(`/boards/999999`).expect(404);
  });
});
