export type GameMode = 'hardcore' | 'lives';
export type TurnTimeLimit = 15 | 30 | 60;

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
  lives?: number;
}

export interface PredefinedQuestion {
  id: string;
  question: string;
  attribute: string;
  value: any;
  category: 'gender' | 'hair' | 'eyes' | 'accessories';
}

export interface GameConfig {
  mode: GameMode;
  turnTime: TurnTimeLimit;
}

export interface GameState {
  roomId: string;
  players: Player[];
  turn: string;
  status: 'waiting' | 'playing' | 'finished';
  winner?: string;
  turnStartTime?: number;
  turnTimeLimit?: number;
  config?: GameConfig;
}
