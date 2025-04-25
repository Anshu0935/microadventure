
import { Treasure, Obstacle, UserLocation, GameState } from '../types';

export interface GameContextProps {
  userLocation: UserLocation | null;
  treasures: Treasure[];
  obstacles: Obstacle[];
  gameState: GameState;
  isLoading: boolean;
  error: string | null;
  cameraActive: boolean;
  selectedTreasure: Treasure | null;
  selectedObstacle: Obstacle | null;
  updateUserLocation: (position: GeolocationPosition) => void;
  toggleCamera: () => void;
  collectTreasure: (treasureId: string) => void;
  clearObstacle: (obstacleId: string) => void;
  selectTreasure: (treasureId: string | null) => void;
  selectObstacle: (obstacleId: string | null) => void;
  resetGame: () => void;
}
