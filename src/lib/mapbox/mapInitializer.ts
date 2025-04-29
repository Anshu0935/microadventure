
import mapboxgl from 'mapbox-gl';
import { MAPBOX_ACCESS_TOKEN, MAP_STYLE, MAX_ZOOM, MIN_ZOOM, TILE_CACHE_DURATION } from './constants';
import { UserLocation } from '@/types';

// Create a performance-optimized map instance
export const initializeMap = (
  container: HTMLDivElement, 
  userLocation: UserLocation | null
): mapboxgl.Map => {
  mapboxgl.accessToken = MAPBOX_ACCESS_TOKEN;
  
  console.time('mapInitialization');
  console.log('Map initializing...');
  
  // Create a more performance-optimized game-like map
  const map = new mapboxgl.Map({
    container,
    style: MAP_STYLE, // Lighter style loads faster
    center: userLocation ? [userLocation.lng, userLocation.lat] : [0, 0],
    zoom: userLocation ? 16 : 2,
    attributionControl: false,
    maxZoom: MAX_ZOOM,
    minZoom: MIN_ZOOM,
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
            'Cache-Control': `max-age=${TILE_CACHE_DURATION}` // Cache tiles longer
          }
        };
      }
      return { url };
    }
  });

  return map;
};

// Log map performance metrics
export const logMapPerformance = (): void => {
  console.timeEnd('mapInitialization');
  console.log('Game map loaded!');
};
