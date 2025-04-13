import { hasRoom } from "../../server/db/rooms";

export const ROOM_CODE_LENGTH = 6;

function generateRoomCode() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"; // Apenas caracteres válidos
  let code = "";
  for (let i = 0; i < ROOM_CODE_LENGTH; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export function generateUniqueRoomCode(){
  const code = generateRoomCode();
  if(hasRoom(code)){
    return generateUniqueRoomCode();
  }
  
  return code;
}
