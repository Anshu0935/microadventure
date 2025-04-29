
import mapboxgl from 'mapbox-gl';
import { UserLocation } from '@/types';

// Create a player marker
export const createPlayerMarker = (
  map: mapboxgl.Map, 
  location: UserLocation,
  existingMarker: mapboxgl.Marker | null
): mapboxgl.Marker => {
  if (existingMarker) {
    existingMarker.setLngLat([location.lng, location.lat]);
    return existingMarker;
  }
  
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
  const marker = new mapboxgl.Marker({
    element: el,
    rotationAlignment: 'map',
    pitchAlignment: 'auto'
  })
  .setLngLat([location.lng, location.lat])
  .addTo(map);
  
  return marker;
};

// Add or update player detection radius
export const updatePlayerRadius = (
  map: mapboxgl.Map,
  location: UserLocation
): void => {
  const circleId = 'player-radius';
  const source = map.getSource(circleId);

  if (!source) {
    map.addSource(circleId, {
      type: 'geojson',
      data: {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [location.lng, location.lat]
        },
        properties: {
          radius: 100
        }
      }
    });

    map.addLayer({
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
        coordinates: [location.lng, location.lat]
      },
      properties: {
        radius: 100
      }
    });
  }
};
