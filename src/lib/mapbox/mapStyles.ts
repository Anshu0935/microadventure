
import mapboxgl from 'mapbox-gl';
import { HIDDEN_LAYERS } from './constants';

// Apply batch style operations for performance
export const applyMapStyles = (map: mapboxgl.Map) => {
  // Disable unnecessary layers for performance
  HIDDEN_LAYERS.forEach(layer => {
    if (map.getLayer(layer)) {
      map.setLayoutProperty(layer, 'visibility', 'none');
    }
  });
  
  // Simple styling for better performance
  if (map.getLayer('water')) {
    map.setPaintProperty('water', 'fill-color', '#a2d2ff');
  }
  
  if (map.getLayer('landuse')) {
    map.setPaintProperty('landuse', 'fill-color', [
      'match',
      ['get', 'class'],
      'park', '#90ee90',
      'cemetery', '#b4eeb4',
      'hospital', '#ffebcd',
      'school', '#ffe4b5',
      '#f8f4f0'
    ]);
  }
};

// Add fog effect if hardware supports it
export const applyFogEffect = (map: mapboxgl.Map) => {
  if (map.setFog && window.navigator.hardwareConcurrency > 4) {
    map.setFog({
      'color': 'rgb(220, 230, 240)',
      'horizon-blend': 0.1
    });
  }
};
