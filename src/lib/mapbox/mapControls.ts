
import mapboxgl from 'mapbox-gl';

// Add minimal controls in one batch
export const addNavigationControls = (map: mapboxgl.Map) => {
  const nav = new mapboxgl.NavigationControl({
    showCompass: true,
    visualizePitch: false,
    showZoom: true
  });
  
  map.addControl(nav, 'bottom-right');
};
