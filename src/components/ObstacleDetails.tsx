
import React from 'react';
import { useGame } from '@/contexts/GameContext';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { calculateDistance } from '@/utils/gameUtils';

const ObstacleDetails = () => {
  const { selectedObstacle, userLocation, clearObstacle, selectObstacle } = useGame();
  
  if (!selectedObstacle) return null;
  
  const distance = userLocation 
    ? calculateDistance(userLocation, selectedObstacle) 
    : null;
  
  const canClear = distance !== null && distance <= 30; // Within 30 meters
  
  // Colors for difficulty
  const difficultyColors: Record<string, string> = {
    easy: 'bg-green-100 text-green-800 border-green-200',
    medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    hard: 'bg-red-100 text-red-800 border-red-200'
  };
  
  return (
    <Card className="w-full max-w-md mx-auto my-4">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>{selectedObstacle.type.charAt(0).toUpperCase() + selectedObstacle.type.slice(1)}</CardTitle>
          <Badge className={difficultyColors[selectedObstacle.difficulty]}>
            {selectedObstacle.difficulty.toUpperCase()}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-600 mb-4">
          A {selectedObstacle.difficulty} {selectedObstacle.type} blocking your path to treasure!
        </p>
        <div className="flex justify-between items-center">
          <span className="font-medium">10 points for clearing</span>
          {distance !== null && (
            <span className="text-sm">
              Distance: {Math.round(distance)}m
            </span>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={() => selectObstacle(null)}>
          Close
        </Button>
        {!selectedObstacle.completed && (
          <Button 
            onClick={() => clearObstacle(selectedObstacle.id)}
            disabled={!canClear}
            className={canClear ? 'bg-adventure-danger hover:bg-adventure-danger/80' : ''}
          >
            {canClear ? 'Clear Obstacle' : 'Get Closer'}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default ObstacleDetails;
