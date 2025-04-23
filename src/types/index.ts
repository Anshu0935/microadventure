
export interface Treasure {
  id: string;
  name: string;
  description: string;
  points: number;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  lat: number;
  lng: number;
  found?: boolean;
  image?: string;
}

export interface Obstacle {
  id: string;
  type: 'barrier' | 'puzzle' | 'guardian';
  difficulty: 'easy' | 'medium' | 'hard';
  lat: number;
  lng: number;
  completed?: boolean;
}

export interface UserLocation {
  lat: number;
  lng: number;
  accuracy: number;
}

export interface GameState {
  treasuresFound: number;
  obstaclesCleared: number;
  score: number;
}
