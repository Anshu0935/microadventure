
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

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/outdoors-v12',
      center: userLocation ? [userLocation.lng, userLocation.lat] : [0, 0],
      zoom: 15,
      pitch: 45,
      attributionControl: true,
    });

    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
    map.current.addControl(new mapboxgl.GeolocateControl({
      positionOptions: { enableHighAccuracy: true },
      trackUserLocation: true,
      showUserHeading: true,
    }));

    map.current.on('style.load', () => {
      setMapLoaded(true);
      
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

  return {
    mapContainer,
    map,
    userMarker,
    mapLoaded
  };
};
