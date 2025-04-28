
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Play } from "lucide-react";

const TutorialPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const totalSteps = 4;

  const tutorials = [
    {
      title: "Welcome to Your Quest",
      content: "This tutorial will guide you through the basics of treasure hunting in AR.",
      image: "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?auto=format&fit=crop&w=800&q=80"
    },
    {
      title: "Using the Map",
      content: "Gold dots represent treasures, colored dots represent obstacles. Move closer to interact with them!",
      image: "https://images.unsplash.com/photo-1531297484001-80022131f5a1?auto=format&fit=crop&w=800&q=80"
    },
    {
      title: "AR Camera Mode",
      content: "Switch to AR mode when near a treasure or obstacle to interact with it in your environment.",
      image: "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?auto=format&fit=crop&w=800&q=80"
    },
    {
      title: "Ready to Begin",
      content: "You're all set! Start exploring and collecting treasures in your area.",
      image: "https://images.unsplash.com/photo-1487058792275-0ad4aaf24ca7?auto=format&fit=crop&w=800&q=80"
    }
  ];

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(prev => prev + 1);
    } else {
      navigate("/game");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-adventure-primary/10 to-adventure-secondary/10 p-4">
      <Card className="w-full max-w-2xl p-6 space-y-6">
        <div className="space-y-4">
          <Progress value={(step / totalSteps) * 100} className="w-full" />
          
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold text-adventure-primary">
              {tutorials[step - 1].title}
            </h1>
            <p className="text-adventure-secondary">
              {tutorials[step - 1].content}
            </p>
          </div>

          <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
            <img 
              src={tutorials[step - 1].image} 
              alt={tutorials[step - 1].title}
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        <div className="flex justify-center pt-4">
          <Button 
            onClick={handleNext}
            className="bg-adventure-primary hover:bg-adventure-primary/90 gap-2"
          >
            {step === totalSteps ? (
              <>
                Start Game <Play className="w-4 h-4" />
              </>
            ) : (
              "Next Step"
            )}
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default TutorialPage;
