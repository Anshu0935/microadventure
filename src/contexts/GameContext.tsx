
import { createContext, useContext, useState, ReactNode } from 'react';
import { GameContextProps } from './types';
import { useLocation } from '@/hooks/useLocation';
import { useGameState } from '@/hooks/useGameState';

const GameContext = createContext<GameContextProps | undefined>(undefined);

export const GameProvider = ({ children }: { children: ReactNode }) => {
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const { userLocation, isLoading, error, updateUserLocation } = useLocation();
  const {
    treasures,
    obstacles,
    gameState,
    selectedTreasure,
    selectedObstacle,
    collectTreasure,
    clearObstacle,
    selectTreasure,
    selectObstacle,
    resetGame,
  } = useGameState(userLocation);

  const toggleCamera = () => {
    setCameraActive(!cameraActive);
  };

  return (
    <GameContext.Provider
      value={{
        userLocation,
        treasures,
        obstacles,
        gameState,
        isLoading,
        error,
        cameraActive,
        selectedTreasure,
        selectedObstacle,
        updateUserLocation,
        toggleCamera,
        collectTreasure,
        clearObstacle,
        selectTreasure,
        selectObstacle,
        resetGame,
      }}
    >
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};
