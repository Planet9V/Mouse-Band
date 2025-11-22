import React from 'react';
import { MouseMusician } from '../types';

interface MouseCardProps {
  musician: MouseMusician;
  isActive?: boolean;
  isPlaying?: boolean;
  bpm?: number;
}

const MouseCard: React.FC<MouseCardProps> = ({ musician, isActive = false, isPlaying = false, bpm = 100 }) => {
  
  // Calculate animation style dynamically based on instrument and BPM
  const getAnimationStyles = () => {
    if (!isPlaying) return {};

    // 60 / BPM = duration of one beat in seconds
    const beatDuration = 60 / bpm;
    
    // Drums get a punchy, on-the-beat bounce
    if (musician.instrument === 'Drums') {
        return {
            animation: `bump ${beatDuration}s cubic-bezier(0.4, 0, 0.6, 1) infinite`,
            transformOrigin: 'center bottom'
        };
    }
    
    // String instruments (Guitar/Bass) get a rhythmic swaying/rocking motion
    // We double the beat duration for swaying to make it feel like a groove (every 2 beats)
    return {
        animation: `rock ${beatDuration * 2}s ease-in-out infinite`,
        transformOrigin: 'bottom center'
    };
  };

  return (
    <div 
        className={`flex flex-col gap-3 group cursor-pointer transition-transform duration-500 ${!isPlaying ? 'hover:scale-105' : ''}`}
        style={getAnimationStyles()}
    >
      <div 
        className={`
            w-full bg-center bg-no-repeat bg-cover rounded-xl 
            aspect-[3/4] shadow-lg
            transition-all duration-300
            ${isActive ? 'ring-4 ring-offset-2 ring-offset-background-dark ring-primary scale-105' : 'opacity-80 hover:opacity-100'}
        `}
        style={{ backgroundImage: `url("${musician.imageUrl}")` }}
        role="img"
        aria-label={`Stylized illustration of a mouse playing ${musician.instrument}`}
      >
        {/* Overlay when playing to show rhythm pulse on the card surface */}
        {isPlaying && (
            <div 
                className="w-full h-full bg-primary/20 rounded-xl"
                style={{ animation: `pulse ${60 / bpm}s cubic-bezier(0.4, 0, 0.6, 1) infinite` }}
            ></div>
        )}
      </div>
      <div className={`text-center transition-opacity duration-300 ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
        <p className="text-cream font-bold text-lg">{musician.name}</p>
        <p className="text-cream/60 text-sm uppercase tracking-widest">{musician.instrument}</p>
      </div>
    </div>
  );
};

export default MouseCard;