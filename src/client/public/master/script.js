/**
 * @typedef {{
 *  id: string,
 *  name: string,
 *  hp: number,
 *  hpMax: number,
 *  sp: number,
 *  spMax: number,
 *  ca: number,
 *  movimento: number,
 *  ataque: string,
 *  alcance: number,
 * }} Character
 */

// Conectar ao servidor via Socket.IO
const socket = io({
  transports: ["websocket", "polling"], // Força o uso de WebSocket e polling
});

function createRoom() {
  socket.emit("createRoomRequest");
}

socket.on("createRoomResponse", (response) => {
  if (response.error) {
    alert(response.error);
    return;
  }

  alert(`Sala criada com sucesso! Código da sala: ${response.roomCode}`);
  document.getElementById("masterControls").style.display = "block";
  document.getElementById(
    "dashboardTitle"
  ).innerHTML = `Painel do Mestre, sala <strong>${response.roomCode}</strong>`;
});

socket.on(
  "playerJoined",
  /**
   * @param {{character: Character}} data
   */
  ({ character }) => {
    const playerListEl = document.getElementById("playerList");
    if (!playerListEl) {
      console.error("Elemento 'playerList' não encontrado!");
      return;
    }
    const newPlayer = document.createElement("li");
    newPlayer.id = character.id;
    newPlayer.innerHTML = `
        <strong>${character.name}</strong><br>
        HP: ${character.hp}/${character.hpMax}<br>
        SP: ${character.sp}/${character.spMax}<br>
        CA: ${character.ca}<br>
        Movimento: ${character.movimento} blocos<br>
        Ataque: ${character.ataque}<br>
        Alcance: ${character.alcance} blocos<br>
    `;
    playerListEl.appendChild(newPlayer);
  }
);

socket.on(
  "playerUpdated",
  /**
   * @param {{character: Character}} data
   */
  ({ character }) => {
    const playerListEl = document.getElementById("playerList");
    if (!playerListEl) {
      console.error("Elemento 'playerList' não encontrado!");
      return;
    }

    const playerEl = document.getElementById(character.id);
    if (!playerEl) {
      console.error(`Jogador ${character.name} não encontrado!`);
      return;
    }

    playerEl.innerHTML = `
        <strong>${character.name}</strong><br>
        HP: ${character.hp}/${character.hpMax}<br>
        SP: ${character.sp}/${character.spMax}<br>
        CA: ${character.ca}<br>
        Movimento: ${character.movimento} blocos<br>
        Ataque: ${character.ataque}<br>
        Alcance: ${character.alcance} blocos<br>
    `;
  }
);

socket.on(
  "playerLeft",
  /**
   * @param {{characterId: string}} data
   */
  ({ characterId }) => {
    const playerListEl = document.getElementById("playerList");
    if (!playerListEl) {
      console.error("Elemento 'playerList' não encontrado!");
      return;
    }

    const playerEl = document.getElementById(characterId);
    if (!playerEl) {
      console.error(`Jogador ${characterId} não encontrado!`);
      return;
    }

    playerListEl.removeChild(playerEl);
  }
);
