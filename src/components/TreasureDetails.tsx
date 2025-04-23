
import React from 'react';
import { useGame } from '@/contexts/GameContext';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { calculateDistance } from '@/utils/gameUtils';

const TreasureDetails = () => {
  const { selectedTreasure, userLocation, collectTreasure, selectTreasure } = useGame();
  
  if (!selectedTreasure) return null;
  
  const distance = userLocation 
    ? calculateDistance(userLocation, selectedTreasure) 
    : null;
  
  const canCollect = distance !== null && distance <= 30; // Within 30 meters
  
  // Colors for rarity
  const rarityColors: Record<string, string> = {
    common: 'bg-slate-100 text-slate-800 border-slate-200',
    uncommon: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    rare: 'bg-blue-100 text-blue-800 border-blue-200',
    epic: 'bg-purple-100 text-purple-800 border-purple-200',
    legendary: 'bg-amber-100 text-amber-800 border-amber-200'
  };
  
  return (
    <Card className="w-full max-w-md mx-auto my-4">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>{selectedTreasure.name}</CardTitle>
          <Badge className={rarityColors[selectedTreasure.rarity]}>
            {selectedTreasure.rarity.toUpperCase()}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-600 mb-4">{selectedTreasure.description}</p>
        <div className="flex justify-between items-center">
          <span className="font-medium">{selectedTreasure.points} points</span>
          {distance !== null && (
            <span className="text-sm">
              Distance: {Math.round(distance)}m
            </span>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={() => selectTreasure(null)}>
          Close
        </Button>
        {!selectedTreasure.found && (
          <Button 
            onClick={() => collectTreasure(selectedTreasure.id)}
            disabled={!canCollect}
            className={canCollect ? 'bg-adventure-gold text-black hover:bg-adventure-gold/80' : ''}
          >
            {canCollect ? 'Collect Treasure' : 'Get Closer'}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default TreasureDetails;
