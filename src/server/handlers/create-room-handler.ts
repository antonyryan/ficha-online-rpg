import { generateUniqueRoomCode } from "../../lib/utils/generateRoomCode";
import {
	createRoom,
	getRoomByMaster,
	getRoomByPlayer,
	type Room,
} from "../db/rooms";
import { createMasterSession } from "../db/sessions";
import type { ClientSocket, ServerSocket } from "../types/socket";

export function createRoomHandler(
	clientSocket: ClientSocket,
	serverSocket: ServerSocket,
) {
	clientSocket.on("createRoomRequest", () => {
		const masterRoom = getRoomByMaster(clientSocket.id);
		if (masterRoom) {
			clientSocket.emit("createRoomResponse", {
				status: "error",
				message: "Você já é mestre de uma sala.",
			});
			return;
		}

		const playerRoom = getRoomByPlayer(clientSocket.id);
		if (playerRoom) {
			clientSocket.emit("createRoomResponse", {
				status: "error",
				message: "Você já está em uma sala.",
			});
			return;
		}

		const roomCode = generateUniqueRoomCode();
		const newRoom: Room = {
			players: [],
			sessionMasterId: clientSocket.id,
		};

		const created = createRoom(roomCode, newRoom);
		if (!created) {
			clientSocket.emit("createRoomResponse", {
				status: "error",
				message: "Erro ao criar sala.",
			});
			return;
		}

		createMasterSession(clientSocket.id, roomCode);

		clientSocket.emit("createRoomResponse", {
			status: "success",
			roomCode,
		});
	});
}
