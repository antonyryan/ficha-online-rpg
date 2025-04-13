import { getRoomByCode, updateRoom } from "../db/rooms";
import { getPlayerRoomCode } from "../db/sessions";
import type { ClientSocket, ServerSocket } from "../types/socket";

export type PlayerStatusUpdateAction =
	| "reduceHp"
	| "increaseHp"
	| "reduceSp"
	| "increaseSp";

export function playerStatusUpdateHandler(
	clientSocket: ClientSocket,
	serverSocker: ServerSocket,
) {
	clientSocket.on("updateStatusRequest", ({ action }) => {
		const playerSessionRoomCode = getPlayerRoomCode(clientSocket.id);
		if (!playerSessionRoomCode) {
			clientSocket.emit("updateStatusResponse", {
				status: "error",
				message: "Usuário não encontrado na sala",
			});
			return;
		}

		const room = getRoomByCode(playerSessionRoomCode);
		if (!room) {
			clientSocket.emit("updateStatusResponse", {
				status: "error",
				message: "Sala não encontrada",
			});
			return;
		}

		const player = room.players.find((p) => p.sessionId === clientSocket.id);
		if (!player) {
			clientSocket.emit("updateStatusResponse", {
				status: "error",
				message: "Usuário não encontrado na sala",
			});
			return;
		}

		switch (action) {
			case "reduceHp":
				if (player.hp <= 0) {
					clientSocket.emit("updateStatusResponse", {
						status: "error",
						message: "HP já está zerado",
					});
					return;
				}
				player.hp -= 1;
				break;

			case "increaseHp":
				if (player.hp + 1 > player.hpMax) {
					clientSocket.emit("updateStatusResponse", {
						status: "error",
						message: "HP já está no máximo",
					});
					return;
				}
				player.hp += 1;
				break;

			case "reduceSp":
				if (player.sp <= 0) {
					clientSocket.emit("updateStatusResponse", {
						status: "error",
						message: "SP já está zerado",
					});
					return;
				}
				player.sp -= 1;
				break;

			case "increaseSp":
				if (player.sp + 1 > player.spMax) {
					clientSocket.emit("updateStatusResponse", {
						status: "error",
						message: "SP já está no máximo",
					});
					return;
				}
				player.sp += 1;
				break;

			default:
				clientSocket.emit("updateStatusResponse", {
					status: "error",
					message: "Ação inválida",
				});
				return;
		}

		const otherPlayers = room.players.filter(
			(p) => p.sessionId !== clientSocket.id,
		);
		room.players = [player, ...otherPlayers];

		const updatedRoom = updateRoom(playerSessionRoomCode, room);
		if (!updatedRoom) {
			clientSocket.emit("updateStatusResponse", {
				status: "error",
				message: "Erro ao atualizar sala",
			});
			return;
		}

		const { sessionId, ...character } = player;
		clientSocket.emit("updateStatusResponse", {
			status: "success",
			character,
		});
		serverSocker.to(room.sessionMasterId).emit("playerUpdated", {
			status: "success",
			character,
		});
	});
}
