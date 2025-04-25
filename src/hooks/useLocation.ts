
import { useState, useEffect } from 'react';
import { UserLocation } from '../types';
import { useToast } from '@/components/ui/use-toast';

export const useLocation = () => {
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const updateUserLocation = (position: GeolocationPosition) => {
    const { latitude, longitude, accuracy } = position.coords;
    setUserLocation({
      lat: latitude,
      lng: longitude,
      accuracy: accuracy,
    });
  };

  useEffect(() => {
    if (navigator.geolocation) {
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          updateUserLocation(position);
          setIsLoading(false);
        },
        (error) => {
          console.error('Geolocation error:', error);
          setError('Unable to access your location. Please enable location services.');
          setIsLoading(false);
          toast({
            title: "Location Error",
            description: "Please enable location services to play this game.",
            variant: "destructive",
          });
        },
        {
          enableHighAccuracy: true,
          maximumAge: 0,
          timeout: 5000,
        }
      );

      return () => navigator.geolocation.clearWatch(watchId);
    } else {
      setError('Geolocation is not supported by this browser.');
      setIsLoading(false);
      toast({
        title: "Browser Incompatible",
        description: "Your browser doesn't support geolocation features.",
        variant: "destructive",
      });
    }
  }, []);

  return { userLocation, isLoading, error, updateUserLocation };
};
