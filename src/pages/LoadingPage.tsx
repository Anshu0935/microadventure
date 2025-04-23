
import { Loader } from "lucide-react";

const LoadingPage = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-adventure-primary/10 to-adventure-secondary/10">
      <div className="text-center space-y-4">
        <Loader className="w-16 h-16 text-adventure-primary animate-spin mx-auto" />
        <h1 className="text-3xl font-bold text-adventure-primary animate-pulse">
          Treasure Hunt AR Quest
        </h1>
        <p className="text-adventure-secondary">Preparing your adventure...</p>
      </div>
    </div>
  );
};

export default LoadingPage;
