import React from 'react';

const MusicStaff: React.FC = () => {
  return (
    <div className="absolute bottom-0 left-0 right-0 h-40 w-full overflow-hidden pointer-events-none z-0">
      <div className="absolute inset-0 flex flex-col justify-center gap-3 px-0">
        <div className="staff-line"></div>
        <div className="staff-line"></div>
        <div className="staff-line"></div>
        <div className="staff-line"></div>
        <div className="staff-line"></div>
        
        {/* Floating Notes Container */}
        <div className="absolute inset-0">
          {/* Note 1 */}
          <div className="absolute top-0 animate-note-flow" style={{ animationDuration: '12s', animationDelay: '0s' }}>
            <div className="absolute animate-note-bob" style={{ top: '28px', left: '-5vw' }}>
              <span className="material-symbols-outlined text-yellow text-4xl transform -rotate-12">music_note</span>
            </div>
          </div>

          {/* Note 2 */}
          <div className="absolute top-0 animate-note-flow" style={{ animationDuration: '15s', animationDelay: '2s' }}>
            <div className="absolute animate-note-bob" style={{ top: '50px', left: '-5vw', animationDelay: '0.2s' }}>
              <span className="material-symbols-outlined text-teal text-4xl transform rotate-12">music_note</span>
            </div>
          </div>

          {/* Note 3 */}
          <div className="absolute top-0 animate-note-flow" style={{ animationDuration: '10s', animationDelay: '5s' }}>
            <div className="absolute animate-note-bob" style={{ top: '18px', left: '-5vw', animationDelay: '0.5s' }}>
              <span className="material-symbols-outlined text-coral text-5xl transform -rotate-6">music_note</span>
            </div>
          </div>

           {/* Note 4 */}
           <div className="absolute top-0 animate-note-flow" style={{ animationDuration: '18s', animationDelay: '1s' }}>
            <div className="absolute animate-note-bob" style={{ top: '70px', left: '-5vw', animationDelay: '1s' }}>
              <span className="material-symbols-outlined text-cream/50 text-3xl transform rotate-45">music_note</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MusicStaff;