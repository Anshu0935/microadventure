
import React, { useEffect, useState } from 'react';
import { useGame } from '@/contexts/GameContext';
import { GoogleMap, useLoadScript } from '@react-google-maps/api';
import { calculateDistance } from '@/utils/gameUtils';
import { Compass } from 'lucide-react';
import ProfileDrawer from './ProfileDrawer';
import UserStats from './UserStats';

const MapView = () => {
  const { userLocation, treasures, obstacles, selectTreasure, selectObstacle } = useGame();
  const [map, setMap] = useState<google.maps.Map | null>(null);

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: "YOUR_GOOGLE_MAPS_API_KEY", // This is a publishable key, it's ok to be in the code
    libraries: ['places'],
  });

  const mapOptions: google.maps.MapOptions = {
    disableDefaultUI: true,
    styles: [
      {
        featureType: 'all',
        elementType: 'labels.text.fill',
        stylers: [{ color: '#ffffff' }],
      },
      {
        featureType: 'all',
        elementType: 'labels.text.stroke',
        stylers: [{ color: '#000000' }, { lightness: 13 }],
      },
      {
        featureType: 'water',
        elementType: 'geometry',
        stylers: [{ color: '#022338' }],
      },
      {
        featureType: 'landscape',
        elementType: 'geometry',
        stylers: [{ color: '#1A1F2C' }],
      },
      {
        featureType: 'road',
        elementType: 'geometry.fill',
        stylers: [{ color: '#2c2c2c' }],
      },
      {
        featureType: 'road',
        elementType: 'geometry.stroke',
        stylers: [{ color: '#000000' }, { lightness: 25 }],
      },
      {
        featureType: 'road.highway',
        elementType: 'geometry.fill',
        stylers: [{ color: '#000000' }, { lightness: 17 }],
      },
      {
        featureType: 'poi',
        elementType: 'geometry',
        stylers: [{ color: '#283747' }],
      },
      {
        featureType: 'transit',
        elementType: 'geometry',
        stylers: [{ color: '#2f3948' }],
      },
    ],
  };

  useEffect(() => {
    if (!userLocation || !map) return;

    // Center map on user location
    map.panTo({ lat: userLocation.lat, lng: userLocation.lng });

    // Clear existing markers
    map.overlayMapTypes.clear();

    // Add custom markers for treasures and obstacles
    treasures.forEach(treasure => {
      const distance = calculateDistance(userLocation, treasure);
      if (distance <= 500) { // Only show items within 500m
        const marker = new google.maps.Marker({
          position: { lat: treasure.lat, lng: treasure.lng },
          map,
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 10,
            fillColor: treasure.found ? '#666666' : '#F59E0B',
            fillOpacity: 0.8,
            strokeWeight: 2,
            strokeColor: '#FFFFFF',
          },
          title: `Treasure (${Math.round(distance)}m away)`,
        });

        marker.addListener('click', () => selectTreasure(treasure.id));
      }
    });

    obstacles.forEach(obstacle => {
      const distance = calculateDistance(userLocation, obstacle);
      if (distance <= 500) { // Only show items within 500m
        const marker = new google.maps.Marker({
          position: { lat: obstacle.lat, lng: obstacle.lng },
          map,
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 10,
            fillColor: obstacle.completed ? '#666666' : '#DC2626',
            fillOpacity: 0.8,
            strokeWeight: 2,
            strokeColor: '#FFFFFF',
          },
          title: `Obstacle (${Math.round(distance)}m away)`,
        });

        marker.addListener('click', () => selectObstacle(obstacle.id));
      }
    });

    // Add player marker with pulse effect
    const playerMarker = new google.maps.Marker({
      position: { lat: userLocation.lat, lng: userLocation.lng },
      map,
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 12,
        fillColor: '#8B5CF6',
        fillOpacity: 0.8,
        strokeWeight: 3,
        strokeColor: '#FFFFFF',
      },
    });

    // Create pulse circle
    const pulseCircle = new google.maps.Circle({
      map,
      center: { lat: userLocation.lat, lng: userLocation.lng },
      radius: 20,
      fillColor: '#8B5CF6',
      fillOpacity: 0.3,
      strokeWeight: 0,
    });

    // Animate pulse
    let opacity = 0.3;
    let expanding = true;
    setInterval(() => {
      if (expanding) {
        opacity -= 0.01;
        if (opacity <= 0.1) expanding = false;
      } else {
        opacity += 0.01;
        if (opacity >= 0.3) expanding = true;
      }
      pulseCircle.setOptions({ fillOpacity: opacity });
    }, 50);

  }, [userLocation, map, treasures, obstacles]);

  if (!isLoaded) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-[#1A1F2C]">
        <Compass className="h-12 w-12 text-adventure-primary animate-pulse" />
        <p className="text-lg font-medium mt-4 text-white">Loading map...</p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-screen overflow-hidden">
      <GoogleMap
        mapContainerClassName="w-full h-full"
        center={userLocation ? { lat: userLocation.lat, lng: userLocation.lng } : { lat: 0, lng: 0 }}
        zoom={18}
        options={mapOptions}
        onLoad={map => setMap(map)}
      />

      {/* Profile Button */}
      <ProfileDrawer />

      {/* User Stats Component */}
      <UserStats />
    </div>
  );
};

export default MapView;
