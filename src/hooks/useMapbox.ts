
import { useRef, useState, useEffect, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import { UserLocation } from '@/types';
import { initializeMap, logMapPerformance } from '@/lib/mapbox/mapInitializer';
import { applyMapStyles, applyFogEffect } from '@/lib/mapbox/mapStyles';
import { addNavigationControls } from '@/lib/mapbox/mapControls';
import { createPlayerMarker, updatePlayerRadius } from '@/lib/mapbox/markers';

export const useMapbox = (userLocation: UserLocation | null) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const userMarker = useRef<mapboxgl.Marker | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  
  // Initialize map only once with optimized settings
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    // Create map instance
    map.current = initializeMap(mapContainer.current, userLocation);

    // Optimize map load event to reduce work on initial load
    map.current.once('load', () => {
      if (!map.current) return;
      
      logMapPerformance();
      
      // Batch style operations for performance
      const batchOperations = () => {
        applyMapStyles(map.current!);
        addNavigationControls(map.current!);
        applyFogEffect(map.current!);
      };
      
      // Defer non-essential operations to after the map is visible
      setTimeout(batchOperations, 100);
      
      // Set map as loaded
      setMapLoaded(true);
    });

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  // Memoize player marker creation to reduce re-renders
  const createPlayerMarkerMemoized = useCallback((location: UserLocation) => {
    if (!map.current) return null;
    
    userMarker.current = createPlayerMarker(map.current, location, userMarker.current);
    return userMarker.current;
  }, []);

  // Update user position with optimized rendering
  useEffect(() => {
    if (!map.current || !mapLoaded || !userLocation) return;

    // Smoothly update camera with performance in mind
    map.current.easeTo({
      center: [userLocation.lng, userLocation.lat],
      duration: 500
    });

    // Update player marker
    createPlayerMarkerMemoized(userLocation);

    // Update player's detection radius efficiently
    updatePlayerRadius(map.current, userLocation);
    
  }, [userLocation, mapLoaded, createPlayerMarkerMemoized]);

  return {
    mapContainer,
    map,
    userMarker,
    mapLoaded
  };
};
