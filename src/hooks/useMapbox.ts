
import { useRef, useState, useEffect, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import { UserLocation } from '@/types';

export const useMapbox = (userLocation: UserLocation | null) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const userMarker = useRef<mapboxgl.Marker | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  
  // Initialize map only once with optimized settings
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    // Pre-initialize variables to avoid recalculations
    mapboxgl.accessToken = 'pk.eyJ1IjoibG92YWJsZSIsImEiOiJjbHQ3ZjlwbXYwYmF0MmpvNTB4Y3Y1MzJiIn0.a5zvZ6-DUlGxLxMEQXwSXw';
    
    // Console time tracking for performance monitoring
    console.time('mapInitialization');
    
    // Create a more performance-optimized game-like map
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      // Use a lightweight style for faster loading
      style: 'mapbox://styles/mapbox/light-v10', // Lighter style loads faster
      center: userLocation ? [userLocation.lng, userLocation.lat] : [0, 0],
      zoom: userLocation ? 16 : 2,
      attributionControl: false,
      maxZoom: 19.5,
      minZoom: 2,
      antialias: false, // Disable antialiasing for better performance
      pitch: 0,
      bearing: 0,
      trackResize: true,
      renderWorldCopies: false,
      fadeDuration: 0, // Disable fade animations for performance
      // Performance optimization options
      preserveDrawingBuffer: false, // Better performance
      localIdeographFontFamily: "'Noto Sans', sans-serif",
      transformRequest: (url, resourceType) => {
        // Only load essential resources
        if (resourceType === 'Tile' && url.includes('mapbox.com')) {
          return {
            url,
            headers: {
              'Cache-Control': 'max-age=3600' // Cache tiles longer
            }
          };
        }
        return { url };
      }
    });

    // Add a loading indicator
    console.log('Map initializing...');

    // Optimize map load event to reduce work on initial load
    map.current.once('load', () => {
      if (!map.current) return;
      
      console.timeEnd('mapInitialization');
      console.log('Game map loaded!');
      
      // Batch style operations for performance
      const batchOperations = () => {
        // Disable unnecessary layers for performance
        const hideLayers = ['poi-label', 'transit-label', 'road-label'];
        hideLayers.forEach(layer => {
          if (map.current?.getLayer(layer)) {
            map.current.setLayoutProperty(layer, 'visibility', 'none');
          }
        });
        
        // Simple styling for better performance
        if (map.current?.getLayer('water')) {
          map.current.setPaintProperty('water', 'fill-color', '#a2d2ff');
        }
        
        if (map.current?.getLayer('landuse')) {
          map.current.setPaintProperty('landuse', 'fill-color', [
            'match',
            ['get', 'class'],
            'park', '#90ee90',
            'cemetery', '#b4eeb4',
            'hospital', '#ffebcd',
            'school', '#ffe4b5',
            '#f8f4f0'
          ]);
        }
        
        // Add minimal controls in one batch
        const controls = document.createElement('div');
        controls.className = 'mapboxgl-ctrl-group mapboxgl-ctrl';
        controls.style.margin = '10px';
        
        const nav = new mapboxgl.NavigationControl({
          showCompass: true,
          visualizePitch: false,
          showZoom: true
        });
        
        map.current?.addControl(nav, 'bottom-right');
        
        // Add subtle fog effect (but only if it doesn't impact performance)
        if (map.current?.setFog && window.navigator.hardwareConcurrency > 4) {
          map.current.setFog({
            'color': 'rgb(220, 230, 240)',
            'horizon-blend': 0.1
          });
        }
      };
      
      // Defer non-essential operations to after the map is visible
      setTimeout(batchOperations, 100);
      
      // Set map as loaded
      setMapLoaded(true);
    });

    return () => {
      if (map.current) {
        map.current.remove();
      }
    };
  }, []);

  // Memoize player marker creation to reduce re-renders
  const createPlayerMarker = useCallback((location: UserLocation) => {
    if (!map.current) return null;
    
    // Reuse DOM elements when possible
    if (!userMarker.current) {
      // Create avatar container - simplified for performance
      const el = document.createElement('div');
      el.className = 'w-8 h-8 relative'; // Slightly smaller for performance
      
      // Create avatar circle - simplified styling
      const avatar = document.createElement('div');
      avatar.className = 'absolute inset-0 bg-adventure-primary rounded-full border-2 border-white shadow-md z-10';
      
      // Create simplified pulse effect
      const pulse = document.createElement('div');
      pulse.className = 'absolute -inset-3 bg-adventure-primary/30 rounded-full animate-pulse z-5';
      
      // Add elements to container
      el.appendChild(pulse);
      el.appendChild(avatar);
      
      // Create and add marker - optimized
      userMarker.current = new mapboxgl.Marker({
        element: el,
        rotationAlignment: 'map',
        pitchAlignment: 'auto'
      })
      .setLngLat([location.lng, location.lat])
      .addTo(map.current);
    } else {
      userMarker.current.setLngLat([location.lng, location.lat]);
    }
    
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
    createPlayerMarker(userLocation);

    // Update player's detection radius efficiently
    const circleId = 'player-radius';
    const source = map.current.getSource(circleId);

    if (!source) {
      map.current.addSource(circleId, {
        type: 'geojson',
        data: {
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [userLocation.lng, userLocation.lat]
          },
          properties: {
            radius: 100
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
          'circle-opacity': 0.1,
          'circle-stroke-width': 1, // Reduced for performance
          'circle-stroke-color': '#8B5CF6',
          'circle-stroke-opacity': 0.3
        }
      });
    } else if (source.type === 'geojson') {
      (source as mapboxgl.GeoJSONSource).setData({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [userLocation.lng, userLocation.lat]
        },
        properties: {
          radius: 100
        }
      });
    }
  }, [userLocation, mapLoaded, createPlayerMarker]);

  return {
    mapContainer,
    map,
    userMarker,
    mapLoaded
  };
};
