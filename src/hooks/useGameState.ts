
import { useState, useEffect } from 'react';
import { Treasure, Obstacle, UserLocation, GameState } from '../types';
import { useToast } from '@/components/ui/use-toast';
import { generateNearbyTreasures, generateNearbyObstacles } from '@/utils/gameUtils';

export const useGameState = (userLocation: UserLocation | null) => {
  const [treasures, setTreasures] = useState<Treasure[]>([]);
  const [obstacles, setObstacles] = useState<Obstacle[]>([]);
  const [gameState, setGameState] = useState<GameState>({
    treasuresFound: 0,
    obstaclesCleared: 0,
    score: 0,
  });
  const [selectedTreasure, setSelectedTreasure] = useState<Treasure | null>(null);
  const [selectedObstacle, setSelectedObstacle] = useState<Obstacle | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (userLocation) {
      const newTreasures = generateNearbyTreasures(userLocation, 5);
      const newObstacles = generateNearbyObstacles(userLocation, 3);
      setTreasures(newTreasures);
      setObstacles(newObstacles);
    }
  }, [userLocation]);

  const collectTreasure = (treasureId: string) => {
    const treasure = treasures.find(t => t.id === treasureId);
    if (!treasure || treasure.found) return;

    const updatedTreasures = treasures.map(t => 
      t.id === treasureId ? { ...t, found: true } : t
    );

    setTreasures(updatedTreasures);
    setGameState(prev => ({
      ...prev,
      treasuresFound: prev.treasuresFound + 1,
      score: prev.score + treasure.points,
    }));

    toast({
      title: "Treasure Found!",
      description: `You found ${treasure.name} worth ${treasure.points} points!`,
      variant: "default",
    });

    setSelectedTreasure(null);
  };

  const clearObstacle = (obstacleId: string) => {
    const obstacle = obstacles.find(o => o.id === obstacleId);
    if (!obstacle || obstacle.completed) return;

    const updatedObstacles = obstacles.map(o => 
      o.id === obstacleId ? { ...o, completed: true } : o
    );

    setObstacles(updatedObstacles);
    setGameState(prev => ({
      ...prev,
      obstaclesCleared: prev.obstaclesCleared + 1,
      score: prev.score + 10,
    }));

    toast({
      title: "Obstacle Cleared!",
      description: `You cleared a ${obstacle.difficulty} ${obstacle.type}!`,
      variant: "default",
    });

    setSelectedObstacle(null);
  };

  const selectTreasure = (treasureId: string | null) => {
    if (!treasureId) {
      setSelectedTreasure(null);
      return;
    }
    const treasure = treasures.find(t => t.id === treasureId);
    setSelectedTreasure(treasure || null);
  };

  const selectObstacle = (obstacleId: string | null) => {
    if (!obstacleId) {
      setSelectedObstacle(null);
      return;
    }
    const obstacle = obstacles.find(o => o.id === obstacleId);
    setSelectedObstacle(obstacle || null);
  };

  const resetGame = () => {
    setGameState({
      treasuresFound: 0,
      obstaclesCleared: 0,
      score: 0,
    });
    
    if (userLocation) {
      const newTreasures = generateNearbyTreasures(userLocation, 5);
      const newObstacles = generateNearbyObstacles(userLocation, 3);
      setTreasures(newTreasures);
      setObstacles(newObstacles);
    }
    
    toast({
      title: "Game Reset",
      description: "New treasures and obstacles have been generated!",
      variant: "default",
    });
  };

  return {
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
  };
};
