
import React from 'react';
import { PsychometricSegment } from '../types';

interface PsychometricScrollerProps {
  segments: PsychometricSegment[];
  label: string;
  speed?: 'slow' | 'medium' | 'fast';
  direction?: 'left' | 'right';
  isActive?: boolean;
}

const PsychometricScroller: React.FC<PsychometricScrollerProps> = ({ 
  segments, 
  label, 
  speed = 'medium',
  isActive = true 
}) => {
  
  const getDuration = () => {
    // Base duration on content length to keep speed somewhat consistent
    const baseSpeed = speed === 'slow' ? 30 : speed === 'fast' ? 10 : 20;
    return `${Math.max(10, segments.length * 3)}s`;
  };

  return (
    <div className="w-full flex flex-col gap-2 overflow-hidden bg-background-dark/30 border-y border-cream/10 py-4 relative group">
      {/* Label Badge */}
      <div className="absolute left-4 top-0 -translate-y-1/2 z-10">
        <span className="bg-indigo text-cream text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded border border-cream/20">
            {label}
        </span>
      </div>

      {/* Scroller Container */}
      <div 
        className="flex gap-8 whitespace-nowrap hover:[animation-play-state:paused]"
        style={{ 
            animation: isActive ? `scroll-left ${getDuration()} linear infinite` : 'none',
            transform: !isActive ? 'translateX(0)' : undefined
        }}
      >
        {/* Render twice for seamless loop */}
        {[...segments, ...segments].map((segment, idx) => (
          <div key={idx} className="flex flex-col gap-2 min-w-[100px] opacity-80 hover:opacity-100 transition-opacity">
            {/* The Text */}
            <p className="text-lg md:text-xl font-serif italic text-cream">
              "{segment.text}"
            </p>
            
            {/* The "Cleft" (Psychometric Bar) */}
            <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                    {/* The visual marker */}
                    <div className="h-[2px] w-4 bg-cream/20"></div>
                    <div 
                        className="h-1.5 w-full rounded-full shadow-[0_0_10px_rgba(255,255,255,0.2)]"
                        style={{ backgroundColor: segment.colorCode }}
                    ></div>
                </div>
                {/* The Analysis Label */}
                <span 
                    className="text-[10px] uppercase tracking-wider font-bold ml-6"
                    style={{ color: segment.colorCode }}
                >
                    {segment.label}
                </span>
            </div>
          </div>
        ))}
      </div>
      
      {/* Gradient Masks for Fade Effect */}
      <div className="absolute top-0 bottom-0 left-0 w-12 bg-gradient-to-r from-background-dark to-transparent z-10 pointer-events-none"></div>
      <div className="absolute top-0 bottom-0 right-0 w-12 bg-gradient-to-l from-background-dark to-transparent z-10 pointer-events-none"></div>
    </div>
  );
};

export default PsychometricScroller;
