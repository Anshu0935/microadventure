
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Book } from "lucide-react";

const InstructionsPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-adventure-primary/10 to-adventure-secondary/10 p-4">
      <Card className="w-full max-w-2xl p-6 space-y-6">
        <div className="text-center space-y-2">
          <Book className="w-12 h-12 text-adventure-primary mx-auto" />
          <h1 className="text-3xl font-bold text-adventure-primary">How to Play</h1>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-adventure-secondary">🗺️ Navigation</h2>
            <p>Use the map to locate nearby treasures and obstacles within your vicinity.</p>
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-adventure-secondary">📱 AR Camera</h2>
            <p>Switch to AR mode to scan your surroundings and discover hidden treasures.</p>
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-adventure-secondary">💎 Treasures</h2>
            <p>Find and collect treasures to earn points. Rarer treasures are worth more!</p>
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-adventure-secondary">🚧 Obstacles</h2>
            <p>Overcome obstacles by solving puzzles or completing challenges.</p>
          </div>
        </div>

        <div className="flex justify-center pt-4">
          <Button 
            onClick={() => navigate("/tutorial")}
            className="bg-adventure-primary hover:bg-adventure-primary/90"
          >
            Continue to Tutorial
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default InstructionsPage;
