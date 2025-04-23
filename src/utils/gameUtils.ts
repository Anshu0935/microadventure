
import { Treasure, Obstacle, UserLocation } from '../types';
import { v4 as uuidv4 } from 'uuid';

// Generate a random point within a certain radius of a given location
const generateRandomPointNear = (
  center: { lat: number; lng: number },
  radiusInM: number
): { lat: number; lng: number } => {
  // Earth's radius in meters
  const earthRadius = 6378137;
  
  // Convert radius from meters to degrees
  const radiusInDeg = radiusInM / earthRadius * (180 / Math.PI);
  
  // Generate random angle
  const angle = Math.random() * 2 * Math.PI;
  
  // Generate random distance within the radius
  const distance = Math.sqrt(Math.random()) * radiusInDeg;
  
  // Calculate offsets
  const latOffset = distance * Math.cos(angle);
  const lngOffset = distance * Math.sin(angle) / Math.cos(center.lat * Math.PI / 180);
  
  return {
    lat: center.lat + latOffset,
    lng: center.lng + lngOffset
  };
};

// Calculate distance between two points in meters
export const calculateDistance = (
  point1: { lat: number; lng: number },
  point2: { lat: number; lng: number }
): number => {
  const toRad = (value: number) => (value * Math.PI) / 180;
  
  const R = 6371e3; // Earth radius in meters
  const φ1 = toRad(point1.lat);
  const φ2 = toRad(point2.lat);
  const Δφ = toRad(point2.lat - point1.lat);
  const Δλ = toRad(point2.lng - point1.lng);
  
  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  
  return R * c;
};

// Generate treasure data
const treasureNames = [
  'Ancient Coin', 'Golden Chalice', 'Crystal Orb', 'Emerald Necklace',
  'Ruby Ring', 'Sapphire Crown', 'Diamond Dagger', 'Silver Bracelet',
  'Obsidian Statue', 'Jade Figurine', 'Bronze Medallion', 'Amber Gemstone'
];

const treasureDescriptions = [
  'A mysterious artifact from an ancient civilization.',
  'A valuable treasure hidden by pirates centuries ago.',
  'A rare and precious gemstone with magical properties.',
  'A royal treasure lost during a historic battle.',
  'A sacred relic sought by treasure hunters for generations.'
];

const getRarity = (): 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' => {
  const rand = Math.random();
  if (rand < 0.4) return 'common';
  if (rand < 0.7) return 'uncommon';
  if (rand < 0.9) return 'rare';
  if (rand < 0.98) return 'epic';
  return 'legendary';
};

// Generate obstacles data
const obstacleTypes = ['barrier', 'puzzle', 'guardian'] as const;
const obstacleDifficulties = ['easy', 'medium', 'hard'] as const;

// Generate treasures near user location
export const generateNearbyTreasures = (
  userLocation: UserLocation,
  count: number
): Treasure[] => {
  const treasures: Treasure[] = [];
  
  for (let i = 0; i < count; i++) {
    // Generate points within 100-300 meters
    const minDistance = 50 + Math.random() * 100; // 50-150m
    const maxDistance = 150 + Math.random() * 150; // 150-300m
    
    const distance = minDistance + Math.random() * (maxDistance - minDistance);
    const location = generateRandomPointNear(userLocation, distance);
    
    const rarity = getRarity();
    let points;
    
    // Assign points based on rarity
    switch (rarity) {
      case 'common': points = 10 + Math.floor(Math.random() * 10); break;
      case 'uncommon': points = 20 + Math.floor(Math.random() * 20); break;
      case 'rare': points = 40 + Math.floor(Math.random() * 30); break;
      case 'epic': points = 70 + Math.floor(Math.random() * 50); break;
      case 'legendary': points = 120 + Math.floor(Math.random() * 80); break;
    }
    
    treasures.push({
      id: uuidv4(),
      name: treasureNames[Math.floor(Math.random() * treasureNames.length)],
      description: treasureDescriptions[Math.floor(Math.random() * treasureDescriptions.length)],
      points,
      rarity,
      lat: location.lat,
      lng: location.lng,
      found: false,
    });
  }
  
  return treasures;
};

// Generate obstacles near user location
export const generateNearbyObstacles = (
  userLocation: UserLocation,
  count: number
): Obstacle[] => {
  const obstacles: Obstacle[] = [];
  
  for (let i = 0; i < count; i++) {
    // Generate points within 50-200 meters
    const location = generateRandomPointNear(userLocation, 50 + Math.random() * 150);
    
    obstacles.push({
      id: uuidv4(),
      type: obstacleTypes[Math.floor(Math.random() * obstacleTypes.length)],
      difficulty: obstacleDifficulties[Math.floor(Math.random() * obstacleDifficulties.length)],
      lat: location.lat,
      lng: location.lng,
      completed: false,
    });
  }
  
  return obstacles;
};

// Check if user is close enough to interact with a treasure or obstacle
export const isUserCloseEnough = (
  userLocation: UserLocation,
  point: { lat: number; lng: number },
  maxDistanceM: number = 30 // Default 30 meters
): boolean => {
  const distance = calculateDistance(userLocation, point);
  return distance <= maxDistanceM;
};
