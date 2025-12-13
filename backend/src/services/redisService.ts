import { createClient } from "redis";
import { GameState, Player, GameConfig } from "../types";

const redisUrl = process.env.REDIS_URL || (process.env.REDIS_HOST ? `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT || 6379}` : "redis://localhost:6379");
const client = createClient({
  url: redisUrl,
});

client.on("error", (err) => console.log("Redis Client Error", err));

export const connectRedis = async () => {
  await client.connect();
  console.log("Connected to Redis");
};

const ROOM_TTL = 3600; // 1 hour in seconds

export const createRoom = async (
  roomId: string,
  config?: GameConfig
): Promise<GameState> => {
  const initialState: GameState = {
    roomId,
    players: [],
    turn: "",
    status: "waiting",
    config,
  };
  await client.hSet(`room:${roomId}`, {
    data: JSON.stringify(initialState),
  });
  await client.expire(`room:${roomId}`, ROOM_TTL);

  // Add to available rooms list
  await client.sAdd("available_rooms", roomId);
  return initialState;
};

export const getAvailableRooms = async (): Promise<string[]> => {
  return await client.sMembers("available_rooms");
};

export const getRoom = async (roomId: string): Promise<GameState | null> => {
  const data = await client.hGet(`room:${roomId}`, "data");
  if (!data) return null;
  return JSON.parse(data);
};

export const updateRoom = async (roomId: string, state: GameState) => {
  await client.hSet(`room:${roomId}`, {
    data: JSON.stringify(state),
  });
  await client.expire(`room:${roomId}`, ROOM_TTL);
};

export const addPlayerToRoom = async (
  roomId: string,
  player: Player
): Promise<GameState | null> => {
  const room = await getRoom(roomId);
  if (!room) return null;

  if (room.players.length >= 2) return null; // Room full

  room.players.push(player);

  // If room becomes full, remove from available_rooms
  if (room.players.length === 2) {
    await client.sRem("available_rooms", roomId);
  }

  await updateRoom(roomId, room);
  return room;
};

export const setSecretCharacter = async (
  roomId: string,
  playerId: string,
  characterId: number
) => {
  await client.hSet(`room:${roomId}:secrets`, playerId, characterId.toString());
  await client.expire(`room:${roomId}:secrets`, ROOM_TTL);
};

export const getSecretCharacter = async (
  roomId: string,
  playerId: string
): Promise<number | null> => {
  const id = await client.hGet(`room:${roomId}:secrets`, playerId);
  return id ? parseInt(id) : null;
};

export const deleteRoom = async (roomId: string) => {
  await client.del(`room:${roomId}`);
  await client.del(`room:${roomId}:secrets`);
  await client.sRem("available_rooms", roomId);
};

// Online users tracking
export const addOnlineUser = async (username: string) => {
  await client.sAdd("online_users", username);
};

export const removeOnlineUser = async (username: string) => {
  await client.sRem("online_users", username);
};

export const getOnlineUsers = async (): Promise<string[]> => {
  return await client.sMembers("online_users");
};
