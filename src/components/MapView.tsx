
import React, { useEffect, useRef } from 'react';
import { useGame } from '@/contexts/GameContext';
import { Badge } from '@/components/ui/badge';
import { calculateDistance } from '@/utils/gameUtils';
import { Compass, Navigation, UserRound } from 'lucide-react';
import { Button } from './ui/button';
import ProfileDrawer from './ProfileDrawer';
import UserStats from './UserStats';

const MapView = () => {
  const { userLocation, treasures, obstacles, selectTreasure, selectObstacle } = useGame();
  const mapRef = useRef<HTMLDivElement>(null);
  const userMarkerRef = useRef<HTMLDivElement>(null);
  const mapItemsRef = useRef<HTMLDivElement>(null);

  // Update map view when user location changes
  useEffect(() => {
    if (!userLocation) return;
    updateMapItems();
  }, [userLocation, treasures, obstacles]);

  const updateMapItems = () => {
    if (!userLocation || !mapRef.current || !mapItemsRef.current) return;
    
    // Clear previous items
    mapItemsRef.current.innerHTML = '';
    
    // Map dimensions
    const mapSize = Math.min(window.innerWidth, window.innerHeight) * 0.8;
    const mapScale = 2.5; // 1px = 2.5 meters
    const maxRenderDistance = mapSize / 2 / mapScale;
    
    // Add treasures
    treasures.forEach(treasure => {
      const distance = calculateDistance(userLocation, treasure);
      
      // Only render items within visible range
      if (distance <= maxRenderDistance) {
        const angle = Math.atan2(
          treasure.lat - userLocation.lat,
          treasure.lng - userLocation.lng
        );
        
        // Calculate position on map (in pixels)
        const x = Math.cos(angle) * (distance / mapScale);
        const y = Math.sin(angle) * (distance / mapScale);
        
        const treasureEl = document.createElement('div');
        treasureEl.className = `absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer ${
          treasure.found ? 'opacity-50' : 'animate-pulse-gold'
        }`;
        treasureEl.style.left = `calc(50% + ${x}px)`;
        treasureEl.style.top = `calc(50% + ${y}px)`;
        
        const rarityColors: Record<string, string> = {
          common: 'bg-slate-400',
          uncommon: 'bg-emerald-400',
          rare: 'bg-blue-400',
          epic: 'bg-purple-500',
          legendary: 'bg-amber-400'
        };
        
        treasureEl.innerHTML = `
          <div class="relative">
            <div class="w-5 h-5 rounded-full ${rarityColors[treasure.rarity]} flex items-center justify-center">
              <span class="text-xs text-white">T</span>
            </div>
            <div class="absolute -bottom-1 left-5 whitespace-nowrap">
              <span class="text-xs font-medium px-1 py-0.5 rounded ${
                treasure.found ? 'bg-slate-200 text-slate-600' : 'bg-amber-100 text-amber-800'
              }">
                ${Math.round(distance)}m
              </span>
            </div>
          </div>
        `;
        
        treasureEl.addEventListener('click', () => selectTreasure(treasure.id));
        mapItemsRef.current?.appendChild(treasureEl);
      }
    });
    
    // Add obstacles
    obstacles.forEach(obstacle => {
      const distance = calculateDistance(userLocation, obstacle);
      
      if (distance <= maxRenderDistance) {
        const angle = Math.atan2(
          obstacle.lat - userLocation.lat,
          obstacle.lng - userLocation.lng
        );
        
        const x = Math.cos(angle) * (distance / mapScale);
        const y = Math.sin(angle) * (distance / mapScale);
        
        const obstacleEl = document.createElement('div');
        obstacleEl.className = `absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer ${
          obstacle.completed ? 'opacity-50' : ''
        }`;
        obstacleEl.style.left = `calc(50% + ${x}px)`;
        obstacleEl.style.top = `calc(50% + ${y}px)`;
        
        const difficultyColors: Record<string, string> = {
          easy: 'bg-green-500',
          medium: 'bg-yellow-500',
          hard: 'bg-red-500'
        };
        
        obstacleEl.innerHTML = `
          <div class="relative">
            <div class="w-5 h-5 rounded-full ${difficultyColors[obstacle.difficulty]} flex items-center justify-center">
              <span class="text-xs text-white">O</span>
            </div>
            <div class="absolute -bottom-1 left-5 whitespace-nowrap">
              <span class="text-xs font-medium px-1 py-0.5 rounded ${
                obstacle.completed ? 'bg-slate-200 text-slate-600' : 'bg-rose-100 text-rose-800'
              }">
                ${Math.round(distance)}m
              </span>
            </div>
          </div>
        `;
        
        obstacleEl.addEventListener('click', () => selectObstacle(obstacle.id));
        mapItemsRef.current?.appendChild(obstacleEl);
      }
    });
  };

  if (!userLocation) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-900">
        <Compass className="h-12 w-12 text-adventure-primary animate-pulse" />
        <p className="text-lg font-medium mt-4 text-white">Waiting for your location...</p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* Dark themed map container */}
      <div className="absolute inset-0 bg-[#1A1F2C]">
        <div ref={mapRef} className="absolute inset-0">
          {/* Map grid pattern for background */}
          <div className="absolute inset-0" style={{
            backgroundImage: `
              linear-gradient(to right, rgba(255,255,255,0.1) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(255,255,255,0.1) 1px, transparent 1px)
            `,
            backgroundSize: '20px 20px',
            opacity: 0.3
          }} />

          {/* Map content area */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div ref={mapItemsRef} className="absolute inset-0">
              {/* Treasures and obstacles will be rendered here */}
            </div>
            
            {/* User location marker */}
            <div 
              ref={userMarkerRef}
              className="relative"
            >
              <div className="w-6 h-6 bg-adventure-primary rounded-full border-2 border-white shadow-lg z-10">
                <div className="w-full h-full animate-ping bg-adventure-primary opacity-30 rounded-full" />
              </div>
              <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-0 h-0 
                border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent 
                border-t-adventure-primary shadow-md" />
            </div>
          </div>
          
          {/* Compass rose */}
          <div className="absolute top-4 left-4 bg-black/40 backdrop-blur-sm p-2 rounded-lg shadow-md border border-white/10">
            <Navigation className="h-6 w-6 text-white" />
          </div>

          {/* Profile Button */}
          <ProfileDrawer />

          {/* User Stats Component */}
          <UserStats />
        </div>
      </div>
    </div>
  );
};

export default MapView;
