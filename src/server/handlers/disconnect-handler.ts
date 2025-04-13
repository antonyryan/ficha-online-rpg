import {
  deleteRoom,
  getRoomByCode,
  getRoomByPlayer,
  updateRoom,
} from "../db/rooms";
import {
  deleteMasterSession,
  deletePlayerSession,
  getMasterRoomCode,
  getPlayerRoomCode,
} from "../db/sessions";
import type { ClientSocket, ServerSocket } from "../types/socket";

export function disconnectHandler(
  clientSocket: ClientSocket,
  serverSocket: ServerSocket
) {
  clientSocket.on("disconnect", () => {
    const masterSessionRoomCode = getMasterRoomCode(clientSocket.id);
    const playerSessionRoomCode = getPlayerRoomCode(clientSocket.id);
    if (playerSessionRoomCode) {
      const room = getRoomByCode(playerSessionRoomCode);
      if (room) {
        const player = room.players.find(
          (player) => player.sessionId === clientSocket.id
        );
        if (!player) return;

        const remainingPlayers = room.players.filter((p) => p.id !== player.id);

        room.players = remainingPlayers;
        updateRoom(playerSessionRoomCode, room);
        deletePlayerSession(clientSocket.id);

        serverSocket
          .to(room.sessionMasterId)
          .emit("playerLeft", { status: "success", characterId: player.id });
      }
    }

    if (masterSessionRoomCode) {
      const room = getRoomByCode(masterSessionRoomCode);
      if (!room) return;

      const playersSessionIds = room.players.map((player) => player.sessionId);

      deleteRoom(masterSessionRoomCode);
      deleteMasterSession(clientSocket.id);
      serverSocket.to(playersSessionIds).emit("masterLeft");
    }
    // const playerSession = getPlayerRoomCode(clientSocket.id);
    // const masterSession = getMasterRoomCode(clientSocket.id);
    // if (playerSession || masterSession) {
    //   const room = getRoomByCode(playerSession || masterSession);
    //   if (!room) return;
    //   const remainingPlayers = room.players.filter((player) => player.sessionId !== clientSocket.id);
    //   room.players = remainingPlayers;
    // serverSocket.emit("playerLeft", { player:  });
    // }
  });
}
