import { createServer } from "node:http";
import path from "node:path";

import express from "express";
import { Server } from "socket.io";

import { STATIC_CHARACTERS } from "./server/models/character";
import type {
	ClientToServerEvents,
	ServerToClientEvents,
} from "./server/types/socket";
import { joinRoomHandler } from "./server/handlers/join-room-handler";
import { disconnectHandler } from "./server/handlers/disconnect-handler";
import { createRoomHandler } from "./server/handlers/create-room-handler";
import { playerStatusUpdateHandler } from "./server/handlers/player-status-update-handler";

const PORT = 3000;
const app = express();
const httpServer = createServer(app);

const serverSocket = new Server<ClientToServerEvents, ServerToClientEvents>(
	httpServer,
	{
		cors: {
			origin: "*", // Permite conexões de qualquer origem
			methods: ["GET", "POST"],
		},
		transports: ["websocket", "polling"], // Habilita WebSocket e polling como fallback
	},
);

serverSocket.on("connection", (clientSocket) => {
	createRoomHandler(clientSocket, serverSocket);

	joinRoomHandler(clientSocket, serverSocket);

	playerStatusUpdateHandler(clientSocket, serverSocket);

	disconnectHandler(clientSocket, serverSocket);
});

// Servir arquivos estáticos da pasta "public"
app.use(express.static(path.join(__dirname, "client/public")));

// Rota principal (index.html)
app.get("/", (req, res) => {
	res.sendFile(path.join(__dirname, "client/public/home", "index.html"));
});

// Rota para o painel do mestre (master.html)
app.get("/master", (req, res) => {
	res.sendFile(path.join(__dirname, "public/master", "index.html"));
});

app.get("/api/characters", (req, res) => {
	res.json(STATIC_CHARACTERS);
});

httpServer.listen(PORT).on("listening", () => {
	console.log(`Server listening on port ${PORT}`);
});
