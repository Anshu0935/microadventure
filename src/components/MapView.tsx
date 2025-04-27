
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

    mapboxgl.accessToken = 'pk.eyJ1IjoibG92YWJsZSIsImEiOiJjbHQ3ZjlwbXYwYmF0MmpvNTB4Y3Y1MzJiIn0.a5zvZ6-DUlGxLxMEQXwSXw';

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/outdoors-v12', // Changed to outdoors style for better place visibility
      center: userLocation ? [userLocation.lng, userLocation.lat] : [0, 0],
      zoom: 15,
      pitch: 45,
      attributionControl: true,
    });

    // Add zoom and rotation controls
    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
    
    // Add user location control
    map.current.addControl(new mapboxgl.GeolocateControl({
      positionOptions: { enableHighAccuracy: true },
      trackUserLocation: true,
      showUserHeading: true,
    }));

    // Enable terrain if available
    map.current.on('style.load', () => {
      setMapLoaded(true);
      
      // Add 3D buildings layer for more realism
      if (map.current) {
        map.current.addLayer({
          'id': '3d-buildings',
          'source': 'composite',
          'source-layer': 'building',
          'filter': ['==', 'extrude', 'true'],
          'type': 'fill-extrusion',
          'minzoom': 15,
          'paint': {
            'fill-extrusion-color': '#aaa',
            'fill-extrusion-height': ['get', 'height'],
            'fill-extrusion-opacity': 0.6
          }
        });
      }
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

    // Update map center smoothly
    map.current.easeTo({
      center: [userLocation.lng, userLocation.lat],
      duration: 1000
    });

    // Update user location marker with a more visible style
    if (!userMarker.current) {
      const el = document.createElement('div');
      el.className = 'w-6 h-6 bg-adventure-primary rounded-full border-4 border-white shadow-lg relative';
      const pulse = document.createElement('div');
      pulse.className = 'absolute -inset-2 bg-adventure-primary/30 rounded-full animate-pulse';
      el.appendChild(pulse);
      
      userMarker.current = new mapboxgl.Marker(el)
        .setLngLat([userLocation.lng, userLocation.lat])
        .addTo(map.current);
    } else {
      userMarker.current.setLngLat([userLocation.lng, userLocation.lat]);
    }

    // Add accuracy circle with a more subtle style
    const circleId = 'accuracy-circle';
    const circleSource = map.current.getSource(circleId);

    if (!circleSource) {
      map.current.addSource(circleId, {
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
        id: circleId,
        type: 'circle',
        source: circleId,
        paint: {
          'circle-radius': ['get', 'radius'],
          'circle-color': '#8B5CF6',
          'circle-opacity': 0.15,
          'circle-stroke-width': 1,
          'circle-stroke-color': '#8B5CF6'
        }
      });
    }

    // Update treasures with improved styling
    treasures.forEach(treasure => {
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
    });

    // Update obstacles with improved styling
    obstacles.forEach(obstacle => {
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
    });
  }, [userLocation, treasures, obstacles, mapLoaded]);

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
      <ProfileDrawer />
      <UserStats />
    </div>
  );
};

export default MapView;
