// import { JoinRoom, ReSyncRoomState } from "@collabboard/shared";
// import { SocketType } from "../../types";
// import { prisma } from "../../../db/prisma";

// // Check if the user is approved with role to be in that room, if so, sent the roomstate to it
// export function onJoinRoom(socket: SocketType) {
//   socket.on("join_room", async (raw) => {
//     const userId = socket.data.user.id;
//     try {
//       const p = JoinRoom.safeParse(raw);
//       if (!p.success) return; // socket emit "error"
//       const roomId = p.data.roomId;

//       const membership = await prisma.membership.findUnique({
//         where: { userId_roomId: { userId, roomId } },
//         select: { status: true, role: true },
//       });

//       if (membership?.status === "APPROVED" && membership.role) {
//         //TODO: emit room state to the requester
//       } else {
//         //TODO: emit error to the requester
//       }
//     } catch (err) {
//       //TODO: emit error to the requester
//     }
//   });
// }

// // Check permisions if the user is pproved with role to be in that room
// export function onReSyncRoomState(socket: SocketType) {
//   socket.on("resync_room_state", async (raw) => {
//     const userId = socket.data.user.id;
//     try {
//       const p = ReSyncRoomState.safeParse(raw);
//       if (!p.success) return; // socket emit "error"
//       const roomId = p.data.roomId;

//       const membership = await prisma.membership.findUnique({
//         where: { userId_roomId: { userId, roomId } },
//         select: { status: true, role: true },
//       });

//       if (membership?.status === "APPROVED" && membership.role) {
//         //TODO: emit room state to the requester
//       } else {
//         //TODO: emit error to the requester
//       }
//     } catch (err) {
//       //TODO: emit error to the requester
//     }
//   });
// }

// export function emitRoomState(socket: SocketType) {}

// export function emitRoomClosed(socket: SocketType) {}
