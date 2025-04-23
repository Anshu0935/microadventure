
import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Treasure, Obstacle, UserLocation, GameState } from '../types';
import { useToast } from '@/components/ui/use-toast';
import { generateNearbyTreasures, generateNearbyObstacles } from '@/utils/gameUtils';

interface GameContextProps {
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

const GameContext = createContext<GameContextProps | undefined>(undefined);

export const GameProvider = ({ children }: { children: ReactNode }) => {
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [treasures, setTreasures] = useState<Treasure[]>([]);
  const [obstacles, setObstacles] = useState<Obstacle[]>([]);
  const [gameState, setGameState] = useState<GameState>({
    treasuresFound: 0,
    obstaclesCleared: 0,
    score: 0,
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [selectedTreasure, setSelectedTreasure] = useState<Treasure | null>(null);
  const [selectedObstacle, setSelectedObstacle] = useState<Obstacle | null>(null);
  
  const { toast } = useToast();

  // Initialize geolocation
  useEffect(() => {
    if (navigator.geolocation) {
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          updateUserLocation(position);
          setIsLoading(false);
        },
        (error) => {
          console.error('Geolocation error:', error);
          setError('Unable to access your location. Please enable location services.');
          setIsLoading(false);
          toast({
            title: "Location Error",
            description: "Please enable location services to play this game.",
            variant: "destructive",
          });
        },
        {
          enableHighAccuracy: true,
          maximumAge: 0,
          timeout: 5000,
        }
      );

      return () => navigator.geolocation.clearWatch(watchId);
    } else {
      setError('Geolocation is not supported by this browser.');
      setIsLoading(false);
      toast({
        title: "Browser Incompatible",
        description: "Your browser doesn't support geolocation features.",
        variant: "destructive",
      });
    }
  }, []);

  // Generate treasures and obstacles when user location changes
  useEffect(() => {
    if (userLocation) {
      const newTreasures = generateNearbyTreasures(userLocation, 5);
      const newObstacles = generateNearbyObstacles(userLocation, 3);
      
      setTreasures(newTreasures);
      setObstacles(newObstacles);
    }
  }, [userLocation]);

  const updateUserLocation = (position: GeolocationPosition) => {
    const { latitude, longitude, accuracy } = position.coords;
    
    setUserLocation({
      lat: latitude,
      lng: longitude,
      accuracy: accuracy,
    });
  };

  const toggleCamera = () => {
    setCameraActive(!cameraActive);
  };

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
