
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

    // Create a game-like map style similar to Pokémon GO
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      // Use a more colorful, simplified style like in mobile games
      style: 'mapbox://styles/mapbox/streets-v12',
      center: userLocation ? [userLocation.lng, userLocation.lat] : [0, 0],
      zoom: userLocation ? 16 : 2, // Closer zoom for game-like experience
      attributionControl: false,
      maxZoom: 19.5,
      minZoom: 2,
      antialias: true,
      pitch: 0, // Flat view for game-like appearance
      bearing: 0,
      trackResize: true,
      renderWorldCopies: false,
    });

    // Customize the map to look more like a game map
    map.current.once('load', () => {
      if (!map.current) return;
      
      // Log load time for performance tracking
      console.log(`Game map loaded!`);
      
      // Simplify map by removing unnecessary labels
      if (map.current.getLayer('poi-label')) {
        map.current.setLayoutProperty('poi-label', 'visibility', 'none');
      }
      
      // Add minimal controls for game-like feel
      const nav = new mapboxgl.NavigationControl({
        showCompass: true,
        visualizePitch: false,
        showZoom: true
      });
      map.current.addControl(nav, 'bottom-right');
      
      // Add geolocate for player positioning
      const geolocate = new mapboxgl.GeolocateControl({
        positionOptions: { enableHighAccuracy: true },
        trackUserLocation: true,
        showUserHeading: true,
      });
      map.current.addControl(geolocate, 'bottom-right');
      
      // Add subtle fog effect for game atmosphere
      if (map.current.setFog) {
        map.current.setFog({
          'color': 'rgb(220, 230, 240)',
          'horizon-blend': 0.1
        });
      }

      // Apply custom coloring to water features
      if (map.current.getLayer('water')) {
        map.current.setPaintProperty('water', 'fill-color', '#a2d2ff');
      }
      
      // Make parks more vibrant like in Pokémon GO
      if (map.current.getLayer('landuse')) {
        map.current.setPaintProperty('landuse', 'fill-color', [
          'match',
          ['get', 'class'],
          'park', '#90ee90', // Light green for parks
          'cemetery', '#b4eeb4', // Pale green for cemeteries
          'hospital', '#ffebcd', // Blend for hospital areas
          'school', '#ffe4b5', // Light tan for schools
          '#f8f4f0' // Default
        ]);
      }

      // Roads in lighter colors
      if (map.current.getLayer('road-primary')) {
        map.current.setPaintProperty('road-primary', 'line-color', '#f5f5f5');
      }
      if (map.current.getLayer('road-secondary')) {
        map.current.setPaintProperty('road-secondary', 'line-color', '#ffffff');
      }
      
      setMapLoaded(true);
    });

    return () => {
      if (map.current) {
        map.current.remove();
      }
    };
  }, []);

  // Update user position marker with a game-like avatar
  useEffect(() => {
    if (!map.current || !mapLoaded || !userLocation) return;

    // Center map on user
    map.current.easeTo({
      center: [userLocation.lng, userLocation.lat],
      duration: 500
    });

    // Create a custom game-like avatar marker for the player
    if (!userMarker.current) {
      // Create avatar container
      const el = document.createElement('div');
      el.className = 'w-10 h-10 relative';
      
      // Create avatar circle
      const avatar = document.createElement('div');
      avatar.className = 'absolute inset-0 bg-adventure-primary rounded-full border-4 border-white shadow-lg z-10';
      
      // Create player direction indicator
      const direction = document.createElement('div');
      direction.className = 'absolute w-0 h-0 top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20';
      direction.style.borderLeft = '6px solid transparent';
      direction.style.borderRight = '6px solid transparent';
      direction.style.borderBottom = '12px solid white';
      
      // Create pulse effect
      const pulse = document.createElement('div');
      pulse.className = 'absolute -inset-4 bg-adventure-primary/30 rounded-full animate-pulse z-5';
      
      // Add elements to container
      el.appendChild(pulse);
      el.appendChild(avatar);
      el.appendChild(direction);
      
      // Create and add marker
      userMarker.current = new mapboxgl.Marker({
        element: el,
        rotationAlignment: 'map'
      })
      .setLngLat([userLocation.lng, userLocation.lat])
      .addTo(map.current);
    } else {
      userMarker.current.setLngLat([userLocation.lng, userLocation.lat]);
    }

    // Add player's detection radius
    const circleId = 'player-radius';
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
            radius: 100 // Detection radius in meters
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
          'circle-stroke-width': 2,
          'circle-stroke-color': '#8B5CF6',
          'circle-stroke-opacity': 0.3
        }
      });
    } else if (circleSource.type === 'geojson') {
      // Update the circle position as player moves
      (circleSource as mapboxgl.GeoJSONSource).setData({
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
  }, [userLocation, mapLoaded]);

  return {
    mapContainer,
    map,
    userMarker,
    mapLoaded
  };
};
