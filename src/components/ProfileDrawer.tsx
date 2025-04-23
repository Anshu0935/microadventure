
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { useGame } from "@/contexts/GameContext";
import { UserRound } from "lucide-react";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";

const ProfileDrawer = () => {
  const { gameState } = useGame();

  const achievements = [
    {
      title: "Treasure Hunter",
      description: "Treasures Found",
      value: gameState.treasuresFound,
      color: "text-adventure-gold",
      bg: "bg-adventure-gold/10",
    },
    {
      title: "Obstacle Clearer",
      description: "Obstacles Cleared",
      value: gameState.obstaclesCleared,
      color: "text-adventure-secondary",
      bg: "bg-adventure-secondary/10",
    },
    {
      title: "Total Score",
      description: "Points Earned",
      value: gameState.score,
      color: "text-adventure-primary",
      bg: "bg-adventure-primary/10",
    },
  ];

  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="absolute top-4 right-4 bg-black/40 backdrop-blur-sm border-white/10 hover:bg-white/10"
        >
          <UserRound className="h-5 w-5 text-white" />
        </Button>
      </DrawerTrigger>
      <DrawerContent className="bg-[#1A1F2C] border-t border-white/10">
        <DrawerHeader>
          <DrawerTitle className="text-white text-center">Player Profile</DrawerTitle>
        </DrawerHeader>
        <div className="p-4 space-y-4">
          {achievements.map((achievement, index) => (
            <Card
              key={index}
              className="bg-black/40 backdrop-blur-sm border border-white/10 p-4"
            >
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h3 className="text-white font-medium">{achievement.title}</h3>
                  <p className="text-gray-400 text-sm">{achievement.description}</p>
                </div>
                <Badge
                  variant="secondary"
                  className={`${achievement.bg} ${achievement.color}`}
                >
                  {achievement.value}
                </Badge>
              </div>
            </Card>
          ))}
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default ProfileDrawer;
