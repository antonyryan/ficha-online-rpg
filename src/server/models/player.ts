import type { Character } from "./character";

export type Player = Character & {
	sessionId: string;
};
