
import { useState, useEffect } from 'react';

// For TypeScript to recognize the iOS-specific method
interface DeviceOrientationEventStatic extends EventTarget {
  requestPermission?: () => Promise<string>;
}

export const useDeviceOrientation = () => {
  const [deviceOrientationSupport, setDeviceOrientationSupport] = useState<boolean>(false);

  useEffect(() => {
    const checkDeviceOrientationSupport = () => {
      const hasDeviceOrientation = 'DeviceOrientationEvent' in window;
      
      const DeviceOrientation = window.DeviceOrientationEvent as unknown as DeviceOrientationEventStatic;
      const canRequestPermission = hasDeviceOrientation && typeof DeviceOrientation.requestPermission === 'function';
      
      console.log('Device Orientation Support:', {
        hasDeviceOrientation,
        canRequestPermission,
        supportLevel: hasDeviceOrientation 
          ? (canRequestPermission ? 'Full Support' : 'Partial Support') 
          : 'Not Supported'
      });

      setDeviceOrientationSupport(hasDeviceOrientation);
    };

    checkDeviceOrientationSupport();
  }, []);

  const requestDeviceOrientationPermission = async () => {
    const DeviceOrientation = window.DeviceOrientationEvent as unknown as DeviceOrientationEventStatic;
    
    if (typeof DeviceOrientation.requestPermission === 'function') {
      try {
        const response = await DeviceOrientation.requestPermission();
        console.log('Device Orientation Permission:', response);
        
        if (response === 'granted') {
          console.log('Device orientation permissions granted!');
        }
      } catch (error) {
        console.error('Device Orientation Permission Error:', error);
      }
    } else if (deviceOrientationSupport) {
      console.log('Device orientation events available without permission request');
      
      window.addEventListener('deviceorientation', (event) => {
        console.log('Device Orientation Data:', {
          alpha: event.alpha,
          beta: event.beta,
          gamma: event.gamma
        });
      });
    }
  };

  return {
    deviceOrientationSupport,
    requestDeviceOrientationPermission
  };
};
