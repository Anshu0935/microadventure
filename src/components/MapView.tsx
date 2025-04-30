
import React, { useEffect, useRef, useState } from 'react';
import { useGame } from '@/contexts/GameContext';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Compass } from 'lucide-react';
import ProfileDrawer from './ProfileDrawer';
import UserStats from './UserStats';
import { calculateDistance } from '@/utils/gameUtils';
import { useDeviceOrientation } from '@/hooks/useDeviceOrientation';
import { useMapbox } from '@/hooks/useMapbox';
import VRModeToggle from './VRModeToggle';
import { Treasure } from '@/types';
import { Obstacle } from '@/types';

interface Props {
  treasure: Treasure;
}

const TreasureMarker = ({ treasure }: Props) => {
  const { userLocation, selectTreasure } = useGame();
  const { map } = useMapbox(userLocation);

  useEffect(() => {
    if (!map.current || !userLocation) return;

    const distance = calculateDistance(userLocation, treasure);
    if (distance <= 500) {
      const el = document.createElement('div');
      el.className = `w-4 h-4 ${treasure.found ? 'bg-gray-400' : 'bg-adventure-gold'} rounded-full border-2 border-white shadow-lg transform -translate-x-2 -translate-y-2`;
      
      new mapboxgl.Marker(el)
        .setLngLat([treasure.lng, treasure.lat])
        .setPopup(new mapboxgl.Popup({
          offset: 25,
          className: 'rounded-lg shadow-lg'
        }).setHTML(`
          <div class="p-3">
            <h3 class="font-bold text-adventure-primary">${treasure.name}</h3>
            <p class="text-sm text-gray-600">${Math.round(distance)}m away</p>
          </div>
        `))
        .addTo(map.current)
        .getElement()
        .addEventListener('click', () => selectTreasure(treasure.id));
    }
  }, [userLocation, treasure, map, selectTreasure]);

  return null;
};

interface ObstacleProps {
  obstacle: Obstacle;
}

const ObstacleMarker = ({ obstacle }: ObstacleProps) => {
  const { userLocation, selectObstacle } = useGame();
  const { map } = useMapbox(userLocation);

  useEffect(() => {
    if (!map.current || !userLocation) return;

    const distance = calculateDistance(userLocation, obstacle);
    if (distance <= 500) {
      const el = document.createElement('div');
      el.className = `w-4 h-4 ${obstacle.completed ? 'bg-gray-400' : 'bg-adventure-danger'} rounded-full border-2 border-white shadow-lg transform -translate-x-2 -translate-y-2`;
      
      new mapboxgl.Marker(el)
        .setLngLat([obstacle.lng, obstacle.lat])
        .setPopup(new mapboxgl.Popup({
          offset: 25,
          className: 'rounded-lg shadow-lg'
        }).setHTML(`
          <div class="p-3">
            <h3 class="font-bold text-adventure-danger">${obstacle.type}</h3>
            <p class="text-sm text-gray-600">${Math.round(distance)}m away</p>
          </div>
        `))
        .addTo(map.current)
        .getElement()
        .addEventListener('click', () => selectObstacle(obstacle.id));
    }
  }, [userLocation, obstacle, map, selectObstacle]);

  return null;
};

const MapView = () => {
  const { userLocation, treasures, obstacles, selectTreasure, selectObstacle } = useGame();
  const [vrMode, setVrMode] = useState(false);
  const previousPosition = useRef<{lat: number, lng: number} | null>(null);
  const { deviceOrientationSupport, requestDeviceOrientationPermission } = useDeviceOrientation();
  const { mapContainer, map, userMarker, mapLoaded } = useMapbox(userLocation);

  useEffect(() => {
    if (!vrMode || !map.current || !userLocation) return;
    
    if (previousPosition.current) {
      const dx = userLocation.lng - previousPosition.current.lng;
      const dy = userLocation.lat - previousPosition.current.lat;
      
      if (Math.abs(dx) > 0.00001 || Math.abs(dy) > 0.00001) {
        const bearing = (Math.atan2(dx, dy) * 180 / Math.PI);
        
        map.current.easeTo({
          bearing: bearing,
          pitch: 60,
          duration: 1000
        });
      }
    }
    
    previousPosition.current = { lat: userLocation.lat, lng: userLocation.lng };
  }, [userLocation, vrMode]);

  // This effect is now removed since we're using the refactored useMapbox hook which handles marker creation
  // The userMarker is now provided by the useMapbox hook

  const toggleVRMode = () => {
    console.log('VR Mode Toggled:', {
      currentMode: vrMode,
      deviceOrientationSupport
    });

    if (deviceOrientationSupport) {
      requestDeviceOrientationPermission();
    }

    if (map.current) {
      if (!vrMode) {
        map.current.easeTo({
          pitch: 60,
          zoom: 17,
          duration: 1000
        });
      } else {
        map.current.easeTo({
          pitch: 45,
          bearing: 0,
          zoom: 15,
          duration: 1000
        });
      }
    }

    setVrMode(!vrMode);
  };

  if (!mapLoaded) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-white">
        <Compass className="h-12 w-12 text-adventure-primary animate-pulse" />
        <p className="text-lg font-medium mt-4 text-gray-800">Loading map...</p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-screen">
      <div ref={mapContainer} className="absolute inset-0" />
        {treasures.map(treasure => (
          <TreasureMarker key={treasure.id} treasure={treasure} />
        ))}
        {obstacles.map(obstacle => (
          <ObstacleMarker key={obstacle.id} obstacle={obstacle} />
        ))}
      <VRModeToggle 
        vrMode={vrMode}
        deviceOrientationSupport={deviceOrientationSupport}
        onToggle={toggleVRMode}
      />
      <ProfileDrawer />
      <UserStats />
    </div>
  );
};

export default MapView;
