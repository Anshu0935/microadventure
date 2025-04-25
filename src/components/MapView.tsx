import React, { useEffect, useState, useMemo } from 'react';
import { useGame } from '@/contexts/GameContext';
import { GoogleMap, useLoadScript } from '@react-google-maps/api';
import { calculateDistance } from '@/utils/gameUtils';
import { Compass } from 'lucide-react';
import ProfileDrawer from './ProfileDrawer';
import UserStats from './UserStats';

const libraries: ("places" | "drawing" | "geometry" | "localContext" | "visualization")[] = ["places"];

const MapView = () => {
  const { userLocation, treasures, obstacles, selectTreasure, selectObstacle } = useGame();
  const [map, setMap] = useState<google.maps.Map | null>(null);

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: "AIzaSyB41DRUbKWJHPxaFjMAwdrzWzbVKartNGg",
    libraries: libraries
  });

  const mapOptions = useMemo<google.maps.MapOptions>(() => ({
    disableDefaultUI: false,
    styles: [
      {
        featureType: "poi",
        elementType: "labels",
        stylers: [{ visibility: "on" }],
      },
      {
        featureType: "road",
        elementType: "labels",
        stylers: [{ visibility: "on" }],
      },
      {
        featureType: "landscape",
        stylers: [{ color: "#f5f5f5" }],
      },
      {
        featureType: "water",
        stylers: [{ color: "#c3d2e3" }],
      },
      {
        featureType: "transit",
        elementType: "labels",
        stylers: [{ visibility: "on" }],
      }
    ],
    mapTypeControl: true,
    mapTypeControlOptions: {
      style: google.maps.MapTypeControlStyle.DROPDOWN_MENU,
      position: google.maps.ControlPosition.TOP_RIGHT,
    },
    zoomControl: true,
    zoomControlOptions: {
      position: google.maps.ControlPosition.RIGHT_CENTER,
    },
    scaleControl: true,
    streetViewControl: true,
    streetViewControlOptions: {
      position: google.maps.ControlPosition.RIGHT_CENTER,
    },
    fullscreenControl: true,
  }), []);

  useEffect(() => {
    if (!userLocation || !map) return;

    map.panTo({ lat: userLocation.lat, lng: userLocation.lng });

    map.overlayMapTypes.clear();

    new google.maps.Marker({
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
      title: 'Your Location',
    });

    treasures.forEach(treasure => {
      const distance = calculateDistance(userLocation, treasure);
      if (distance <= 500) {
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
      if (distance <= 500) {
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

    new google.maps.Circle({
      map,
      center: { lat: userLocation.lat, lng: userLocation.lng },
      radius: userLocation.accuracy,
      fillColor: '#8B5CF6',
      fillOpacity: 0.1,
      strokeColor: '#8B5CF6',
      strokeOpacity: 0.3,
      strokeWeight: 2,
    });

    let opacity = 0.3;
    let expanding = true;
    const pulseInterval = setInterval(() => {
      if (expanding) {
        opacity -= 0.01;
        if (opacity <= 0.1) expanding = false;
      } else {
        opacity += 0.01;
        if (opacity >= 0.3) expanding = true;
      }
      pulseCircle.setOptions({ fillOpacity: opacity });
    }, 50);

    return () => {
      clearInterval(pulseInterval);
    };
  }, [userLocation, map, treasures, obstacles, selectTreasure, selectObstacle]);

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
      <ProfileDrawer />
      <UserStats />
    </div>
  );
};

export default MapView;
