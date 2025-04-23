
import { useGame } from '@/contexts/GameContext';
import { Card } from '@/components/ui/card';
import { Award, Map, Star } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const UserStats = () => {
  const { gameState } = useGame();

  return (
    <Card className="absolute top-4 right-4 p-4 bg-white/90 backdrop-blur-sm z-10 w-64 shadow-lg">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Star className="w-5 h-5 text-adventure-gold" />
            <span className="font-medium">Score</span>
          </div>
          <Badge variant="secondary" className="bg-adventure-gold/10 text-adventure-gold">
            {gameState.score} pts
          </Badge>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Map className="w-5 h-5 text-adventure-primary" />
            <span className="font-medium">Treasures</span>
          </div>
          <Badge variant="secondary" className="bg-adventure-primary/10 text-adventure-primary">
            {gameState.treasuresFound} found
          </Badge>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-adventure-secondary" />
            <span className="font-medium">Obstacles</span>
          </div>
          <Badge variant="secondary" className="bg-adventure-secondary/10 text-adventure-secondary">
            {gameState.obstaclesCleared} cleared
          </Badge>
        </div>
      </div>
    </Card>
  );
};

export default UserStats;
