// Conectar ao servidor via Socket.IO
const socket = io({
  transports: ["websocket", "polling"], // Força o uso de WebSocket e polling
});

/**
 * @typedef {{
 * name: string,
 * description: string,
 * cooldown: number,
 *
 * spCost: number,
 * hpCost: number,
 * }} Skill
 */

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
 *
 *  skills: [Skill, Skill, Skill]
 * }} Character
 */

/**
 * @typedef {"reduceHp" | "increaseHp" | "reduceSp" | "increaseSp"} PlayerStatusUpdateAction
 */

/**
 * @type {Character[]}
 */
let charactersData = [];

async function populateProfileSelector() {
  const characterSelector = document.getElementById("profileSelect");
  if (!characterSelector) return;

  /**
   * @type {Character[]}
   */
  charactersData = await fetch("/api/characters").then((res) => res.json());

  characterSelector.innerHTML = "";
  if (charactersData.length === 0) {
    characterSelector.innerHTML =
      '<option value="">Nenhum personagem encontrado</option>';
    characterSelector.disabled = true;
    return;
  }
  const defaultOption = document.createElement("option");
  defaultOption.value = "";
  defaultOption.innerText = "Selecionar personagem";
  defaultOption.defaultSelected = true;
  defaultOption.disabled = true;
  defaultOption.hidden = true;

  characterSelector.appendChild(defaultOption);

  for (const profile of charactersData) {
    const newOption = document.createElement("option");
    newOption.value = profile.id;
    newOption.innerText = profile.name;

    characterSelector.appendChild(newOption);
  }
}

// Carregar Perfil Pré-Definido
function loadProfile() {
  const characterSelector = document.getElementById("profileSelect");
  if (!characterSelector) return;
  const characterId = characterSelector.value;

  /**
   * @type {Character}
   */
  const characterData = charactersData.find(
    (character) => character.id === characterId
  );

  if (!characterData) return;

  const skillContainer = document.getElementById("skill-container");
  if (skillContainer) {
    skillContainer.innerHTML = "";
    if (characterData.skills) {
      for (const skill of characterData.skills) {
        const skillElement = document.createElement("div");
        skillElement.classList.add("skill");
        skillElement.innerHTML = `
        <h3>${skill.name}</h3>
        <p>${skill.description}</p>
        <p>Cooldown: ${skill.cooldown} turnos</p>
        `;
        skillContainer.appendChild(skillElement);
      }
    }
  }

  document.getElementById("characterName").value = characterData.name;
  document.getElementById("initialHp").value = characterData.hp;
  document.getElementById("initialSp").value = characterData.spMax;
  document.getElementById("initialCa").value = characterData.ca;
  document.getElementById("initialMovimento").value = characterData.movimento;
  document.getElementById("initialAtaque").value = characterData.ataque;
  document.getElementById("initialAlcance").value = characterData.alcance;

  const roomCodeInput = document.getElementById("roomCode");
  if (roomCodeInput) roomCodeInput.focus();
}

// Inicializa a ficha com os valores definidos pelo usuário
function initCharacter() {
  const characterSelector = document.getElementById("profileSelect");
  if (!characterSelector) return;

  const roomCodeInput = document.getElementById("roomCode");
  if (!roomCodeInput || !roomCodeInput.value)
    return alert("Código da sala inválido");

  const characterId = characterSelector.value;
  if (!characterId) return alert("Selecione um perfil");

  const character = charactersData.find(
    (character) => character.id === characterId
  );
  if (!character) return alert("Personagem não encontrado");

  requestJoinRoom(roomCodeInput.value, character.id);
}

/**
 *
 * @param {Character} character
 */
function displayCharacterSheet(character) {
  document.getElementById("characterTitle").textContent = character.name;
  document.getElementById("hp").textContent = character.hp;
  document.getElementById("hpMax").textContent = character.hpMax;
  document.getElementById("sp").textContent = character.sp;
  document.getElementById("spMax").textContent = character.spMax;
  document.getElementById("ca").textContent = character.ca;
  document.getElementById("movimento").textContent = character.movimento;
  document.getElementById("ataque").textContent = character.ataque;
  document.getElementById("alcance").textContent = character.alcance;
}

/**
 *
 * @param {PlayerStatusUpdateAction} action
 */
function updateStatus(action) {
  socket.emit("updateStatusRequest", { action });
}

// Solicitação de entrada na sala
/**
 *
 * @param {string} roomCode
 * @param {string} characterId
 */
function requestJoinRoom(roomCode, characterId) {
  socket.emit("joinRoomRequest", {
    roomCode,
    characterId,
  });
}

socket.on("joinRoomResponse", (response) => {
  if (response && response.status === "success") {
    const character = response.character;
    displayCharacterSheet(character);
    document.getElementById("setup").style.display = "none";
    document.getElementById("characterSheet").style.display = "block";
    return;
  }
  alert(`Falha ao entrar na sala: ${response.message}`);
});

socket.on("updateStatusResponse", (response) => {
  if (response && response.status === "success") {
    const character = response.character;
    displayCharacterSheet(character);
    return;
  }
  alert(`Falha ao atualizar status: ${response.message}`);
});

socket.on("masterLeft", () => {
  alert(
    "O mestre da sala saiu. Você será redirecionado para a página inicial."
  );
  window.location.reload();
});

async function initScript() {
  await populateProfileSelector();
}

document.addEventListener("DOMContentLoaded", initScript);
