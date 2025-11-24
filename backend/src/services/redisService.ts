import { createClient } from 'redis';
import { GameState, Player } from '../types';

const client = createClient({
    url: process.env.REDIS_URL || 'redis://localhost:6379'
});

client.on('error', (err) => console.log('Redis Client Error', err));

export const connectRedis = async () => {
    await client.connect();
    console.log('Connected to Redis');
};

export const createRoom = async (roomId: string): Promise<GameState> => {
    const initialState: GameState = {
        roomId,
        players: [],
        turn: '',
        status: 'waiting'
    };
    await client.hSet(`room:${roomId}`, {
        data: JSON.stringify(initialState)
    });
    // Add to available rooms list
    await client.sAdd('available_rooms', roomId);
    return initialState;
};

export const getAvailableRooms = async (): Promise<string[]> => {
    return await client.sMembers('available_rooms');
};

export const getRoom = async (roomId: string): Promise<GameState | null> => {
    const data = await client.hGet(`room:${roomId}`, 'data');
    if (!data) return null;
    return JSON.parse(data);
};

export const updateRoom = async (roomId: string, state: GameState) => {
    await client.hSet(`room:${roomId}`, {
        data: JSON.stringify(state)
    });
};

export const addPlayerToRoom = async (roomId: string, player: Player): Promise<GameState | null> => {
    const room = await getRoom(roomId);
    if (!room) return null;
    
    if (room.players.length >= 2) return null; // Room full

    room.players.push(player);
    
    // If room becomes full, remove from available_rooms
    if (room.players.length === 2) {
        await client.sRem('available_rooms', roomId);
    }

    await updateRoom(roomId, room);
    return room;
};

export const setSecretCharacter = async (roomId: string, playerId: string, characterId: number) => {
    await client.hSet(`room:${roomId}:secrets`, playerId, characterId.toString());
};

export const getSecretCharacter = async (roomId: string, playerId: string): Promise<number | null> => {
    const id = await client.hGet(`room:${roomId}:secrets`, playerId);
    return id ? parseInt(id) : null;
};

export const deleteRoom = async (roomId: string) => {
    await client.del(`room:${roomId}`);
    await client.del(`room:${roomId}:secrets`);
    await client.sRem('available_rooms', roomId);
};
