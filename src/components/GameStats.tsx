
import { useGame } from '@/contexts/GameContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const GameStats = () => {
  const { gameState, resetGame } = useGame();
  
  return (
    <Card className="p-4 mb-4 mx-auto max-w-md">
      <div className="flex justify-between items-center">
        <div className="flex flex-col">
          <h3 className="text-xl font-bold">Score: {gameState.score}</h3>
          <div className="flex space-x-4 text-sm text-gray-600">
            <span>🏆 {gameState.treasuresFound} Treasures</span>
            <span>🚧 {gameState.obstaclesCleared} Obstacles</span>
          </div>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={resetGame}
          className="border-adventure-primary text-adventure-primary hover:bg-adventure-primary/10"
        >
          Reset Game
        </Button>
      </div>
    </Card>
  );
};

export default GameStats;
