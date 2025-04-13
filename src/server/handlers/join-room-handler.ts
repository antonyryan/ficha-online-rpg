import util from "node:util";
import { z } from "zod";

import type { ClientSocket, ServerSocket } from "../types/socket";
import { getRoomByCode, getRoomByPlayer, updateRoom } from "../db/rooms";
import { STATIC_CHARACTERS } from "../models/character";
import { createPlayerSession } from "../db/sessions";
import type { Player } from "../models/player";
import { ROOM_CODE_LENGTH } from "../../lib/utils/generateRoomCode";

export const jointRoomRequestSchema = z.object({
	roomCode: z.string().length(ROOM_CODE_LENGTH),
	characterId: z.string().uuid(),
});

export function joinRoomHandler(
	clientSocket: ClientSocket,
	serverSocket: ServerSocket,
) {
	clientSocket.on("joinRoomRequest", (rawData) => {
		const clientRoom = getRoomByPlayer(clientSocket.id);
		if (clientRoom) {
			clientSocket.emit("joinRoomResponse", {
				status: "error",
				message: "Você já está em uma sala.",
			});
			return;
		}

		const parsedData = jointRoomRequestSchema.safeParse(rawData);
		if (!parsedData.success) {
			clientSocket.emit("joinRoomResponse", {
				status: "error",
				message: "Dados inválidos.",
			});
			return;
		}

		const { roomCode, characterId } = parsedData.data;
		const room = getRoomByCode(roomCode);
		if (!room) {
			clientSocket.emit("joinRoomResponse", {
				status: "error",
				message: "Sala não encontrada.",
			});
			return;
		}

		const staticCharacter = STATIC_CHARACTERS.find((c) => c.id === characterId);
		if (!staticCharacter) {
			clientSocket.emit("joinRoomResponse", {
				status: "error",
				message: "Personagem não encontrado.",
			});
			return;
		}

		const characterIsInRoom = room.players.some(
			(p) => p.id === staticCharacter.id,
		);
		if (characterIsInRoom) {
			clientSocket.emit("joinRoomResponse", {
				status: "error",
				message: "Personagem já escolhido.",
			});
			return;
		}

		const newPlayer: Player = {
			...staticCharacter,
			sessionId: clientSocket.id,
		};
		room.players.push(newPlayer);
		// clientSocket.join(roomCode); Investigate how this works
		const updatedRoom = updateRoom(roomCode, room);
		if (!updatedRoom) {
			clientSocket.emit("joinRoomResponse", {
				status: "error",
				message: "Erro ao entrar na sala.",
			});
			return;
		}

		createPlayerSession(clientSocket.id, roomCode);

		clientSocket.emit("joinRoomResponse", {
			status: "success",
			character: staticCharacter,
		});
		serverSocket
			.to(room.sessionMasterId)
			.emit("playerJoined", { status: "success", character: staticCharacter });

		console.log("room: ", util.inspect(room, { depth: null, colors: true }));
	});
}
