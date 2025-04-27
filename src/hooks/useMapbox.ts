
import { useRef, useState, useEffect } from 'react';
import mapboxgl from 'mapbox-gl';
import { UserLocation } from '@/types';

export const useMapbox = (userLocation: UserLocation | null) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const userMarker = useRef<mapboxgl.Marker | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    mapboxgl.accessToken = 'pk.eyJ1IjoibG92YWJsZSIsImEiOiJjbHQ3ZjlwbXYwYmF0MmpvNTB4Y3Y1MzJiIn0.a5zvZ6-DUlGxLxMEQXwSXw';

    // Performance optimizations
    const initialZoom = userLocation ? 13 : 1; // Start with a lower zoom level
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/outdoors-v12',
      center: userLocation ? [userLocation.lng, userLocation.lat] : [0, 0],
      zoom: initialZoom,
      pitch: 45,
      attributionControl: true,
      // Performance options
      maxZoom: 18,
      minZoom: 1,
      antialias: false, // Disable antialiasing for better performance
      preserveDrawingBuffer: false, // Disable preservation of the drawing buffer
      trackResize: false, // Disable automatic canvas resizing
    });

    // Add essential controls
    const nav = new mapboxgl.NavigationControl({ showCompass: false }); // Simplified navigation
    map.current.addControl(nav, 'top-right');
    
    const geolocate = new mapboxgl.GeolocateControl({
      positionOptions: { enableHighAccuracy: true },
      trackUserLocation: true,
      showUserHeading: true,
    });
    map.current.addControl(geolocate);

    // Lazy load 3D buildings
    map.current.on('style.load', () => {
      setMapLoaded(true);
      
      if (map.current && map.current.getZoom() > 15) {
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

    // Only add 3D buildings when zoomed in
    map.current.on('zoom', () => {
      if (map.current && map.current.getZoom() > 15 && !map.current.getLayer('3d-buildings')) {
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

  return {
    mapContainer,
    map,
    userMarker,
    mapLoaded
  };
};
