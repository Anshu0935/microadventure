
import React, { useEffect, useState, useRef } from 'react';
import { useGame } from '@/contexts/GameContext';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Compass } from 'lucide-react';
import ProfileDrawer from './ProfileDrawer';
import UserStats from './UserStats';
import { calculateDistance } from '@/utils/gameUtils';

const MapView = () => {
  const { userLocation, treasures, obstacles, selectTreasure, selectObstacle } = useGame();
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const userMarker = useRef<mapboxgl.Marker | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    // Initialize Mapbox
    mapboxgl.accessToken = 'pk.eyJ1IjoibG92YWJsZSIsImEiOiJjbHQ3ZjlwbXYwYmF0MmpvNTB4Y3Y1MzJiIn0.a5zvZ6-DUlGxLxMEQXwSXw';

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: userLocation ? [userLocation.lng, userLocation.lat] : [0, 0],
      zoom: 15,
      pitch: 45,
    });

    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
    map.current.addControl(new mapboxgl.GeolocateControl({
      positionOptions: { enableHighAccuracy: true },
      trackUserLocation: true,
    }));

    map.current.on('load', () => {
      setMapLoaded(true);
    });

    return () => {
      if (map.current) {
        map.current.remove();
      }
    };
  }, []);

  // Update markers when user location or treasures/obstacles change
  useEffect(() => {
    if (!map.current || !mapLoaded || !userLocation) return;

    // Update map center
    map.current.flyTo({
      center: [userLocation.lng, userLocation.lat],
      essential: true
    });

    // Update user location marker
    if (!userMarker.current) {
      const el = document.createElement('div');
      el.className = 'w-4 h-4 bg-adventure-primary rounded-full border-2 border-white shadow-lg';
      userMarker.current = new mapboxgl.Marker(el)
        .setLngLat([userLocation.lng, userLocation.lat])
        .addTo(map.current);
    } else {
      userMarker.current.setLngLat([userLocation.lng, userLocation.lat]);
    }

    // Add accuracy circle
    if (userLocation.accuracy) {
      map.current.addSource('accuracy-circle', {
        type: 'geojson',
        data: {
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [userLocation.lng, userLocation.lat]
          },
          properties: {
            radius: userLocation.accuracy
          }
        }
      });

      map.current.addLayer({
        id: 'accuracy-circle',
        type: 'circle',
        source: 'accuracy-circle',
        paint: {
          'circle-radius': ['get', 'radius'],
          'circle-color': '#8B5CF6',
          'circle-opacity': 0.2,
          'circle-stroke-width': 2,
          'circle-stroke-color': '#8B5CF6'
        }
      });
    }

    // Add treasures and obstacles within 500m
    treasures.forEach(treasure => {
      const distance = calculateDistance(userLocation, treasure);
      if (distance <= 500) {
        const el = document.createElement('div');
        el.className = `w-3 h-3 rounded-full ${treasure.found ? 'bg-gray-500' : 'bg-adventure-gold'} border border-white`;
        
        new mapboxgl.Marker(el)
          .setLngLat([treasure.lng, treasure.lat])
          .setPopup(new mapboxgl.Popup().setHTML(`
            <div class="p-2">
              <h3 class="font-bold">${treasure.name}</h3>
              <p class="text-sm">${Math.round(distance)}m away</p>
            </div>
          `))
          .addTo(map.current)
          .getElement()
          .addEventListener('click', () => selectTreasure(treasure.id));
      }
    });

    // Add obstacles
    obstacles.forEach(obstacle => {
      const distance = calculateDistance(userLocation, obstacle);
      if (distance <= 500) {
        const el = document.createElement('div');
        el.className = `w-3 h-3 rounded-full ${obstacle.completed ? 'bg-gray-500' : 'bg-adventure-danger'} border border-white`;
        
        new mapboxgl.Marker(el)
          .setLngLat([obstacle.lng, obstacle.lat])
          .setPopup(new mapboxgl.Popup().setHTML(`
            <div class="p-2">
              <h3 class="font-bold">${obstacle.type}</h3>
              <p class="text-sm">${Math.round(distance)}m away</p>
            </div>
          `))
          .addTo(map.current)
          .getElement()
          .addEventListener('click', () => selectObstacle(obstacle.id));
      }
    });
  }, [userLocation, treasures, obstacles, mapLoaded]);

  if (!mapLoaded) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-[#1A1F2C]">
        <Compass className="h-12 w-12 text-adventure-primary animate-pulse" />
        <p className="text-lg font-medium mt-4 text-white">Loading map...</p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-screen overflow-hidden">
      <div ref={mapContainer} className="absolute inset-0" />
      <ProfileDrawer />
      <UserStats />
    </div>
  );
};

export default MapView;
