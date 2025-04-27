
import React from 'react';
import { Glasses } from 'lucide-react';

interface VRModeToggleProps {
  vrMode: boolean;
  deviceOrientationSupport: boolean;
  onToggle: () => void;
}

const VRModeToggle = ({ vrMode, deviceOrientationSupport, onToggle }: VRModeToggleProps) => {
  return (
    <div className="absolute top-4 left-4 z-10">
      <button
        onClick={onToggle}
        className={`flex items-center rounded-lg px-3 py-2 shadow-lg transition-colors ${
          vrMode ? 'bg-adventure-gold text-black' : 'bg-white text-gray-800'
        }`}
        disabled={!deviceOrientationSupport}
      >
        <Glasses className="h-5 w-5 mr-2" />
        <span>
          {deviceOrientationSupport 
            ? (vrMode ? 'Exit VR View' : 'Enter VR View') 
            : 'VR Not Supported'}
        </span>
      </button>
      
      {vrMode && (
        <div className="absolute top-16 left-0 z-10 bg-black/70 text-white px-3 py-1 rounded-lg text-sm">
          VR Mode Active - Move to change view
        </div>
      )}
    </div>
  );
};

export default VRModeToggle;
