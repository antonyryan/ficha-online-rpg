type PlayerSessionId = string;
type MasterSessionId = string;

type RoomCode = string;

// sessionId -> roomCode
const playerSessions = new Map<PlayerSessionId, RoomCode>();

// sessionId -> roomCode
const masterSessions = new Map<MasterSessionId, RoomCode>();

/**
 * Gets the room code by the player's session id
 * @param playerSessionId 
 * @returns RoomCode | undefined
 */
export function getPlayerRoomCode(playerSessionId: PlayerSessionId): RoomCode | undefined {
  return playerSessions.get(playerSessionId);
}

/**
 * Gets the room code by the master's session id
 * @param masterSessionId 
 * @returns RoomCode | undefined
 */
export function getMasterRoomCode(masterSessionId: MasterSessionId): RoomCode | undefined {
  return masterSessions.get(masterSessionId);
}

export function createPlayerSession(playerSessionId: PlayerSessionId, roomCode: RoomCode) {
  return playerSessions.set(playerSessionId, roomCode);
}

export function createMasterSession(masterSessionId: MasterSessionId, roomCode: RoomCode) {
  return masterSessions.set(masterSessionId, roomCode);
}

export function deletePlayerSession(playerSessionId: PlayerSessionId) {
  return playerSessions.delete(playerSessionId);
}

export function deleteMasterSession(masterSessionId: MasterSessionId) {
  return masterSessions.delete(masterSessionId);
}
