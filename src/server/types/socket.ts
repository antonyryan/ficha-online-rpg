import type { DefaultEventsMap, Server, Socket } from "socket.io";
import type { Character } from "../models/character";
import type { PlayerStatusUpdateAction } from "../handlers/player-status-update-handler";

type SocketError = {
	status: "error";
	message: string;
};

type SocketSuccess<T extends object> = {
	status: "success";
} & T;

export interface ServerToClientEvents {
	createRoomResponse: (
		data: SocketError | SocketSuccess<{ roomCode: string }>,
	) => void;

	joinRoomResponse: (
		data:
			| SocketError
			| SocketSuccess<{
					character: Character;
			  }>,
	) => void;

	playerJoined: (data: SocketSuccess<{ character: Character }>) => void;

	updateStatusResponse: (
		data: SocketError | SocketSuccess<{ character: Character }>,
	) => void;
	playerUpdated: (data: SocketSuccess<{ character: Character }>) => void;
  playerLeft: (data: SocketSuccess<{ characterId: string }>) => void;
  masterLeft: () => void;
}

export interface ClientToServerEvents {
	createRoomRequest: () => void;
	joinRoomRequest: (data: { roomCode: string; characterId: string }) => void;
	updateStatusRequest: (data: { action: PlayerStatusUpdateAction }) => void;
}

export type ClientSocket = Socket<
	ClientToServerEvents,
	ServerToClientEvents,
	DefaultEventsMap,
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	any
>;

export type ServerSocket = Server<
	ClientToServerEvents,
	ServerToClientEvents,
	DefaultEventsMap,
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	any
>;
