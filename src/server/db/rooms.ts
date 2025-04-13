import { Character } from "../models/character";
import type { Player } from "../models/player";
import { getMasterRoomCode, getPlayerRoomCode } from "./sessions";

export type Room = {
	sessionMasterId: string;
	players: Player[];
};

const rooms = new Map<string, Room>();

/**
 * Gets a room by its code
 * @param roomCode
 * @returns Room | undefined
 */
export function getRoomByCode(roomCode: string) {
	return rooms.get(roomCode);
}

/**
 * Checks if a room exists
 * @param roomCode
 * @returns boolean
 */
export function hasRoom(roomCode: string) {
	return rooms.has(roomCode);
}

/**
 * Gets a room by the player's session id
 * @param playerSessionId
 * @returns Room | undefined
 */
export function getRoomByPlayer(playerSessionId: string) {
	const room = getPlayerRoomCode(playerSessionId);
	if (!room) return;

	return getRoomByCode(room);
}

/**
 * Gets a room by the master's session id
 * @param masterSessionId
 * @returns Room | undefined
 */
export function getRoomByMaster(masterSessionId: string) {
	const room = getMasterRoomCode(masterSessionId);
	if (!room) return;

	return getRoomByCode(room);
}

export function updateRoom(roomCode: string, room: Room) {
	if (!rooms.has(roomCode)) return false;
	rooms.set(roomCode, room);
	return true;
}

export function createRoom(roomCode: string, room: Room) {
	if (rooms.has(roomCode)) return false;
	rooms.set(roomCode, room);
	return true;
}

export function deleteRoom(roomCode: string) {
  if (!rooms.has(roomCode)) return false;
  rooms.delete(roomCode);
  return true;
}
