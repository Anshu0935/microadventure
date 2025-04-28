
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

    // Further performance optimizations
    const initialZoom = userLocation ? 12 : 1; // Lower initial zoom for faster loading
    
    // Pre-create styles object to avoid runtime calculations
    const mapStyle = 'mapbox://styles/mapbox/light-v11'; // Using light style which is lighter
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: mapStyle,
      center: userLocation ? [userLocation.lng, userLocation.lat] : [0, 0],
      zoom: initialZoom,
      pitch: 0, // Start with flat view, apply pitch later when loaded
      attributionControl: false, // Will add later after map loads
      // Performance options
      maxZoom: 18,
      minZoom: 1,
      antialias: false,
      preserveDrawingBuffer: false,
      trackResize: false,
      fadeDuration: 0, // Disable fade animations for faster rendering
      renderWorldCopies: false, // Disable world copies for simple view
      interactive: false, // Enable interaction after load
    });

    // Set loading state flag
    const loadingStartTime = performance.now();

    // Only add essential controls after map is loaded
    map.current.once('load', () => {
      if (!map.current) return;
      
      // Performance tracking
      const loadTime = performance.now() - loadingStartTime;
      console.log(`Map loaded in ${loadTime}ms`);
      
      // Enable interactions after map loads
      map.current.interactive = true;
      
      // Add controls only after main map load
      const nav = new mapboxgl.NavigationControl({ 
        showCompass: false,
        visualizePitch: false
      });
      map.current.addControl(nav, 'top-right');
      
      // Add attribution control
      map.current.addControl(new mapboxgl.AttributionControl({
        compact: true
      }));
      
      // Add geolocate with minimal options
      const geolocate = new mapboxgl.GeolocateControl({
        positionOptions: { enableHighAccuracy: true },
        trackUserLocation: true,
        showUserHeading: false, // Simplified
      });
      map.current.addControl(geolocate);
      
      // Add slight pitch for better UX
      map.current.easeTo({
        pitch: 30,
        duration: 1000
      });
      
      setMapLoaded(true);
    });

    // Only add 3D buildings at high zoom levels, using event delegation
    map.current.on('zoomend', () => {
      if (!map.current) return;
      
      const currentZoom = map.current.getZoom();
      const has3DLayer = map.current.getLayer('3d-buildings');
      
      // Add 3D buildings only at high zoom and if not already added
      if (currentZoom > 15 && !has3DLayer) {
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
