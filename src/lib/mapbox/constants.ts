
// Mapbox configuration constants
export const MAPBOX_ACCESS_TOKEN = 'pk.eyJ1IjoibG92YWJsZSIsImEiOiJjbHQ3ZjlwbXYwYmF0MmpvNTB4Y3Y1MzJiIn0.a5zvZ6-DUlGxLxMEQXwSXw';

// Map style and configuration
export const MAP_STYLE = 'mapbox://styles/mapbox/light-v10'; // Lighter style loads faster
export const INITIAL_ZOOM = 16;
export const FALLBACK_ZOOM = 2;
export const MAX_ZOOM = 19.5;
export const MIN_ZOOM = 2;

// Cache configuration
export const TILE_CACHE_DURATION = 3600; // Cache tiles for 1 hour

// Layer visibility
export const HIDDEN_LAYERS = ['poi-label', 'transit-label', 'road-label'];

// Map effects
export const FOG_EFFECT = {
  'color': 'rgb(220, 230, 240)',
  'horizon-blend': 0.1
};
