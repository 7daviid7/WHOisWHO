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

export type GameMode = 'hardcore' | 'lives';
export type TurnTimeLimit = 15 | 30 | 60;

export interface Player {
  id: string; // socket id
  name?: string;
  secretCharacterId?: number;
  lives?: number; // for 'lives' mode
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
  turn: string; // socket id of current turn
  status: 'waiting' | 'playing' | 'finished';
  winner?: string;
  turnStartTime?: number; // timestamp when current turn started
  turnTimeLimit?: number; // time limit in seconds (default 60)
  config?: GameConfig; // game configuration
}

export type PowerUpType = 'reveal_trait' | 'extra_time' | 'auto_eliminate';

export interface PowerUp {
  type: PowerUpType;
  name: string;
  description: string;
  uses: number;
}
