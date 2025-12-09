import { PowerUp, PowerUpType } from '../types';

export const availablePowerUps: Record<PowerUpType, Omit<PowerUp, 'uses'>> = {
  reveal_trait: {
    type: 'reveal_trait',
    name: 'Revelar Característica',
    description: 'Revela una característica aleatòria del personatge secret del rival'
  },
  extra_time: {
    type: 'extra_time',
    name: 'Temps Extra',
    description: 'Afegeix 30 segons al temps del teu torn actual'
  },
  auto_eliminate: {
    type: 'auto_eliminate',
    name: 'Eliminació Intel·ligent',
    description: 'Elimina automàticament 3 personatges que no coincideixen amb les respostes rebudes'
  }
};

export function createInitialPowerUps(): PowerUp[] {
  return [
    { ...availablePowerUps.reveal_trait, uses: 1 },
    { ...availablePowerUps.extra_time, uses: 1 },
    { ...availablePowerUps.auto_eliminate, uses: 1 }
  ];
}
