
import { GameProvider } from '@/contexts/GameContext';
import GameStats from '@/components/GameStats';
import MapView from '@/components/MapView';
import ARCamera from '@/components/ARCamera';
import TreasureDetails from '@/components/TreasureDetails';
import ObstacleDetails from '@/components/ObstacleDetails';
import GameInstructions from '@/components/GameInstructions';
import { useGame } from '@/contexts/GameContext';
import { Compass } from 'lucide-react';

// Separate component for game content to use the game context
const GameContent = () => {
  const { selectedTreasure, selectedObstacle, isLoading, error } = useGame();

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-adventure-background">
        <Compass className="h-16 w-16 text-adventure-primary animate-rotate mb-4" />
        <h1 className="text-2xl font-bold mb-2">Treasure Hunt AR Quest</h1>
        <p className="text-adventure-secondary animate-pulse">Loading your adventure...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-adventure-background">
        <div className="max-w-md w-full bg-white p-6 rounded-lg shadow-lg">
          <h1 className="text-2xl font-bold text-adventure-danger mb-4">Location Error</h1>
          <p className="mb-4">{error}</p>
          <p className="text-sm text-gray-600">
            This game requires location access to create an immersive treasure hunting experience. 
            Please enable location services and reload the page.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col p-4 bg-adventure-background">
      <header className="mb-4 text-center">
        <h1 className="text-2xl font-bold text-adventure-primary">Treasure Hunt AR Quest</h1>
        <p className="text-sm text-adventure-secondary">Find hidden treasures in the real world!</p>
      </header>
      
      <main className="flex-1 flex flex-col max-w-md mx-auto w-full">
        <GameInstructions />
        <GameStats />
        
        {selectedTreasure ? (
          <TreasureDetails />
        ) : selectedObstacle ? (
          <ObstacleDetails />
        ) : (
          <>
            <MapView />
            <ARCamera />
          </>
        )}
      </main>
      
      <footer className="mt-6 text-center text-xs text-gray-500">
        <p>Move around to discover treasures and overcome obstacles!</p>
      </footer>
    </div>
  );
};

// Main Index component that provides the game context
const Index = () => {
  return (
    <GameProvider>
      <GameContent />
    </GameProvider>
  );
};

export default Index;
