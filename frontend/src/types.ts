export interface Character {
  id: number;
  name: string;
  image: string;
  attributes: {
    gender: 'home' | 'dona';
    hairColor: 'ros' | 'negre' | 'castany' | 'pel-roig' | 'blanc';
    hasBeard: boolean;
    hasGlasses: boolean;
    hasHat: boolean;
    eyeColor: 'blau' | 'marró' | 'verd';
  };
}

export interface Player {
  id: string;
  name?: string;
  secretCharacterId?: number;
}

export interface GameState {
  roomId: string;
  players: Player[];
  turn: string;
  status: 'waiting' | 'playing' | 'finished';
  winner?: string;
}
