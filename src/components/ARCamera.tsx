
import React, { useEffect, useRef, useState } from 'react';
import { useGame } from '@/contexts/GameContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Camera, Eye, Video, VideoOff, Vr } from 'lucide-react';
import { isUserCloseEnough } from '@/utils/gameUtils';

const ARCamera = () => {
  const { 
    userLocation, 
    cameraActive, 
    toggleCamera, 
    treasures, 
    obstacles,
    selectedTreasure,
    selectedObstacle,
    collectTreasure,
    clearObstacle
  } = useGame();
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const [cameraPermission, setCameraPermission] = useState<boolean | null>(null);
  const [nearbyTreasures, setNearbyTreasures] = useState<string[]>([]);
  const [nearbyObstacles, setNearbyObstacles] = useState<string[]>([]);
  const [vrCapable, setVrCapable] = useState<boolean>(false);
  
  // Check VR capability
  useEffect(() => {
    // Simple check if device might support device orientation
    setVrCapable(!!window.DeviceOrientationEvent);
  }, []);

  // Start/stop camera when cameraActive state changes
  useEffect(() => {
    if (cameraActive) {
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [cameraActive]);

  // Check for nearby objects when user location changes
  useEffect(() => {
    if (!userLocation) return;

    const checkNearbyObjects = () => {
      if (!userLocation) return;

      // Find treasures within 30 meters
      const closebyTreasures = treasures
        .filter(t => !t.found && isUserCloseEnough(userLocation, t, 30))
        .map(t => t.id);
      
      // Find obstacles within 30 meters
      const closebyObstacles = obstacles
        .filter(o => !o.completed && isUserCloseEnough(userLocation, o, 30))
        .map(o => o.id);
      
      setNearbyTreasures(closebyTreasures);
      setNearbyObstacles(closebyObstacles);
    };

    checkNearbyObjects();
    
    // Check every few seconds
    const intervalId = setInterval(checkNearbyObjects, 5000);
    
    return () => clearInterval(intervalId);
  }, [userLocation, treasures, obstacles]);

  const startCamera = async () => {
    if (!videoRef.current) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
        audio: false
      });
      
      videoRef.current.srcObject = stream;
      setCameraPermission(true);
    } catch (err) {
      console.error('Error accessing camera:', err);
      setCameraPermission(false);
    }
  };

  const stopCamera = () => {
    if (!videoRef.current || !videoRef.current.srcObject) return;
    
    const stream = videoRef.current.srcObject as MediaStream;
    const tracks = stream.getTracks();
    
    tracks.forEach(track => track.stop());
    videoRef.current.srcObject = null;
  };

  const handleCollectTreasure = (treasureId: string) => {
    collectTreasure(treasureId);
  };

  const handleClearObstacle = (obstacleId: string) => {
    clearObstacle(obstacleId);
  };

  return (
    <div className="w-full">
      <div className="flex justify-center mb-4 space-x-2">
        <Button 
          onClick={toggleCamera} 
          className={cameraActive ? 'bg-adventure-danger' : 'bg-adventure-primary'}
        >
          {cameraActive ? (
            <><VideoOff className="mr-2 h-4 w-4" /> Stop Camera</>
          ) : (
            <><Camera className="mr-2 h-4 w-4" /> Start AR Camera</>
          )}
        </Button>
        
        {vrCapable && (
          <Button
            variant="outline"
            className="border-adventure-gold text-adventure-gold hover:bg-adventure-gold/10"
          >
            <Vr className="mr-2 h-4 w-4" /> VR View
          </Button>
        )}
      </div>

      {cameraActive && (
        <div className="relative rounded-lg overflow-hidden w-full max-w-md mx-auto aspect-[9/16] bg-black">
          {cameraPermission === false ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
              <Eye className="h-12 w-12 mb-4" />
              <p className="text-lg font-medium">Camera access denied</p>
              <p className="text-sm opacity-70 mt-2">Please allow camera access to use AR features</p>
            </div>
          ) : (
            <>
              <video 
                ref={videoRef} 
                className="w-full h-full object-cover" 
                autoPlay 
                playsInline
              />
              <div className="camera-overlay absolute inset-0">
                {/* 3D VR-like frame overlay */}
                <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-black/40 to-transparent pointer-events-none"></div>
                <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/40 to-transparent pointer-events-none"></div>
                <div className="absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-black/40 to-transparent pointer-events-none"></div>
                <div className="absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-black/40 to-transparent pointer-events-none"></div>
              </div>
              
              {/* AR overlay for nearby treasures & obstacles */}
              <div className="absolute inset-0 pointer-events-none">
                {/* Show nearby treasures */}
                {nearbyTreasures.length > 0 && (
                  <div className="absolute top-4 left-4 right-4 pointer-events-auto">
                    <Card className="p-3 bg-white/80 backdrop-blur-sm border-adventure-gold">
                      <p className="text-sm font-bold">Nearby Treasures!</p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {nearbyTreasures.map(id => {
                          const treasure = treasures.find(t => t.id === id);
                          if (!treasure) return null;
                          return (
                            <Button 
                              key={id} 
                              size="sm" 
                              variant="outline" 
                              className="bg-amber-100 text-amber-800 border-amber-300 hover-scale"
                              onClick={() => handleCollectTreasure(id)}
                            >
                              Collect {treasure.name}
                            </Button>
                          );
                        })}
                      </div>
                    </Card>
                  </div>
                )}
                
                {/* Show nearby obstacles */}
                {nearbyObstacles.length > 0 && (
                  <div className="absolute bottom-4 left-4 right-4 pointer-events-auto">
                    <Card className="p-3 bg-white/80 backdrop-blur-sm border-adventure-danger">
                      <p className="text-sm font-bold">Obstacles Detected!</p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {nearbyObstacles.map(id => {
                          const obstacle = obstacles.find(o => o.id === id);
                          if (!obstacle) return null;
                          return (
                            <Button 
                              key={id} 
                              size="sm" 
                              variant="outline"
                              className="bg-rose-100 text-rose-800 border-rose-300 hover-scale" 
                              onClick={() => handleClearObstacle(id)}
                            >
                              Clear {obstacle.type}
                            </Button>
                          );
                        })}
                      </div>
                    </Card>
                  </div>
                )}
                
                {/* Add 3D perspective guide lines */}
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute left-1/2 top-1/2 w-1 h-1 bg-white/50 rounded-full shadow-glow"></div>
                  <div className="absolute left-1/3 top-1/3 w-0.5 h-0.5 bg-white/30 rounded-full"></div>
                  <div className="absolute left-2/3 top-1/3 w-0.5 h-0.5 bg-white/30 rounded-full"></div>
                  <div className="absolute left-1/3 top-2/3 w-0.5 h-0.5 bg-white/30 rounded-full"></div>
                  <div className="absolute left-2/3 top-2/3 w-0.5 h-0.5 bg-white/30 rounded-full"></div>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default ARCamera;
