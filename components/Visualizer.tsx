import React from 'react';

interface VisualizerProps {
  bpm: number;
}

const Visualizer: React.FC<VisualizerProps> = ({ bpm }) => {
  const barCount = 12;
  // Calculate animation duration based on BPM (60 seconds / BPM)
  const beatDuration = 60 / bpm; 
  
  // Palette colors to cycle through for the bars
  const colors = [
    'bg-primary',
    'bg-yellow',
    'bg-teal',
    'bg-cream'
  ];

  return (
    <div className="flex items-end justify-center gap-2 h-24 w-full max-w-[320px] mx-auto mb-6" aria-hidden="true">
      {Array.from({ length: barCount }).map((_, i) => {
         // Create a wave-like pattern for the delays
         // Using a sine-like offset or just modulo to create rhythm
         const delay = (i * 0.15) % beatDuration;
         const colorClass = colors[i % colors.length];
         
         return (
            <div 
                key={i}
                className={`w-3 md:w-4 rounded-full transition-colors duration-500 ${colorClass}`}
                style={{
                    animationName: 'equalizer',
                    animationDuration: `${beatDuration}s`,
                    animationTimingFunction: 'ease-in-out',
                    animationIterationCount: 'infinite',
                    animationDelay: `-${delay}s`,
                    height: '20%' // Initial height
                }}
            ></div>
         );
      })}
    </div>
  );
};

export default Visualizer;