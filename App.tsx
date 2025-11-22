
import React, { useState, useRef, useEffect } from 'react';
import { MICE_MUSICIANS } from './constants';
import MusicStaff from './components/MusicStaff';
import MouseCard from './components/MouseCard';
import Visualizer from './components/Visualizer';
import PsychometricScroller from './components/PsychometricScroller';
import { generateSongFromSession, generateSongAudio } from './services/geminiService';
import { decodeBase64, pcmToAudioBuffer } from './utils/audioUtils';
import { SongData, SonicGoal } from './types';

type ViewState = 'landing' | 'mixer';

export default function App() {
  const [view, setView] = useState<ViewState>('landing');
  const [sessionInput, setSessionInput] = useState('');
  const [selectedGoal, setSelectedGoal] = useState<SonicGoal>('uplift');
  
  // Loading States
  const [isLoadingMetadata, setIsLoadingMetadata] = useState(false);
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  
  const [songData, setSongData] = useState<SongData | null>(null);
  const [activeMusicianIndex, setActiveMusicianIndex] = useState(0);

  // Audio State
  const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  
  // Refs for Web Audio API
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);

  // Initialize AudioContext
  useEffect(() => {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContextClass) {
        audioContextRef.current = new AudioContextClass({ sampleRate: 24000 });
    }
    return () => {
        if (audioContextRef.current) {
            audioContextRef.current.close();
        }
    };
  }, []);

  // Auto-rotate active musician on landing page
  useEffect(() => {
    if (view === 'landing') {
        const interval = setInterval(() => {
            setActiveMusicianIndex((prev) => (prev + 1) % MICE_MUSICIANS.length);
        }, 2000);
        return () => clearInterval(interval);
    }
  }, [view]);

  const handleStartJamming = () => {
    setView('mixer');
  };

  const stopAudio = () => {
    if (sourceNodeRef.current) {
        sourceNodeRef.current.stop();
        sourceNodeRef.current.disconnect();
        sourceNodeRef.current = null;
    }
    setIsPlayingAudio(false);
  };

  const playAudio = async () => {
    if (!audioBuffer || !audioContextRef.current) return;

    // Ensure context is running (browsers suspend it until user gesture)
    if (audioContextRef.current.state === 'suspended') {
        await audioContextRef.current.resume();
    }

    // Stop any currently playing audio
    stopAudio();

    const source = audioContextRef.current.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(audioContextRef.current.destination);
    
    source.onended = () => {
        setIsPlayingAudio(false);
    };

    source.start();
    sourceNodeRef.current = source;
    setIsPlayingAudio(true);
  };

  const handleGenerate = async () => {
    if (!sessionInput.trim()) return;
    
    // Reset states
    stopAudio();
    setAudioBuffer(null);
    setSongData(null);
    
    // 1. Generate Metadata
    setIsLoadingMetadata(true);
    
    const data = await generateSongFromSession(sessionInput, selectedGoal);
    setSongData(data);
    setIsLoadingMetadata(false);

    // 2. Generate Audio
    if (data && audioContextRef.current) {
        setIsGeneratingAudio(true);
        const audioBase64 = await generateSongAudio(data);
        
        if (audioBase64) {
            const rawBytes = decodeBase64(audioBase64);
            const buffer = await pcmToAudioBuffer(rawBytes, audioContextRef.current);
            setAudioBuffer(buffer);
            setIsGeneratingAudio(false);
            
            // Auto play
            // setTimeout(() => {
            //     playAudio();
            // }, 100);
        } else {
            setIsGeneratingAudio(false);
        }
    }
  };

  const handleReset = () => {
    stopAudio();
    setSongData(null);
    setAudioBuffer(null);
    setSessionInput('');
  };

  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col overflow-x-hidden bg-background-dark text-cream selection:bg-coral selection:text-white">
      {/* Header */}
      <header className="absolute top-0 left-0 right-0 z-20 p-6 md:p-8">
        <div 
            className="flex items-center justify-center sm:justify-start gap-3 cursor-pointer"
            onClick={() => setView('landing')}
        >
          <span className="material-symbols-outlined text-cream text-4xl">music_note</span>
          <span className="text-2xl font-bold tracking-wider">MMM</span>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex flex-1 flex-col relative z-10 w-full max-w-[1200px] mx-auto px-4 pt-24 pb-32">
        
        {/* VIEW: LANDING */}
        {view === 'landing' && (
          <div className="flex flex-col items-center justify-center grow gap-10 animate-fade-in">
            <div className="flex flex-col gap-4 text-center max-w-2xl mx-auto">
              <h1 className="text-5xl md:text-7xl font-black leading-tight tracking-tight text-cream drop-shadow-lg">
                Musical Mood Mixer
              </h1>
              <h2 className="text-cream/80 text-lg md:text-2xl font-light">
                Your AI-Powered Animal Band
              </h2>
            </div>

            <div className="w-full max-w-4xl px-4">
              <div className="grid grid-cols-3 gap-4 md:gap-8">
                {MICE_MUSICIANS.map((musician, idx) => (
                  <MouseCard 
                    key={musician.id} 
                    musician={musician} 
                    isActive={activeMusicianIndex === idx}
                  />
                ))}
              </div>
            </div>

            <div className="flex items-center justify-center gap-4 py-2">
                {MICE_MUSICIANS.map((m, idx) => (
                    <div 
                        key={idx} 
                        className={`h-3 w-3 rounded-full transition-all duration-300 ${activeMusicianIndex === idx ? m.color : 'bg-cream/20'}`} 
                    />
                ))}
            </div>

            <button 
                onClick={handleStartJamming}
                className="flex items-center justify-center h-14 px-10 rounded-full bg-coral text-indigo text-lg font-bold tracking-wide transition-all duration-300 hover:scale-110 hover:shadow-[0_0_20px_rgba(255,107,107,0.5)] active:scale-95"
            >
              Start Session
            </button>
          </div>
        )}

        {/* VIEW: MIXER */}
        {view === 'mixer' && (
          <div className="flex flex-col grow w-full gap-8 animate-fade-in-up">
            
            {/* Input Section - Hide when we have data OR are loading anything */}
            {!songData && !isLoadingMetadata && (
               <div className="flex flex-col grow max-w-2xl mx-auto w-full gap-8">
                  <div className="text-center space-y-2">
                      <h2 className="text-3xl font-bold">Session Check-in</h2>
                      <p className="text-cream/60">How are you feeling right now? Vent, reflect, or just ramble.</p>
                  </div>
                  
                  <div className="flex flex-col gap-6 bg-indigo/40 p-6 rounded-3xl border border-cream/10 backdrop-blur-sm">
                    <textarea 
                        value={sessionInput}
                        onChange={(e) => setSessionInput(e.target.value)}
                        placeholder="I'm feeling a bit overwhelmed with work today and just need to clear my head..."
                        className="w-full h-40 p-4 rounded-xl bg-background-dark/50 border-2 border-cream/10 text-cream text-lg placeholder:text-cream/20 focus:outline-none focus:border-coral focus:ring-1 focus:ring-coral transition-all resize-none"
                    />
                    
                    <div className="space-y-3">
                        <label className="text-sm font-bold uppercase tracking-widest text-cream/50">Sonic Goal</label>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <button 
                                onClick={() => setSelectedGoal('uplift')}
                                className={`p-4 rounded-xl border-2 text-left transition-all ${selectedGoal === 'uplift' ? 'border-yellow bg-yellow/10' : 'border-cream/10 hover:border-cream/30'}`}
                            >
                                <div className="font-bold text-yellow flex items-center gap-2">
                                    <span className="material-symbols-outlined">wb_sunny</span> Uplift
                                </div>
                                <p className="text-xs text-cream/60 mt-1">Boost energy & mood</p>
                            </button>
                            
                            <button 
                                onClick={() => setSelectedGoal('trance')}
                                className={`p-4 rounded-xl border-2 text-left transition-all ${selectedGoal === 'trance' ? 'border-teal bg-teal/10' : 'border-cream/10 hover:border-cream/30'}`}
                            >
                                <div className="font-bold text-teal flex items-center gap-2">
                                    <span className="material-symbols-outlined">waves</span> Trance
                                </div>
                                <p className="text-xs text-cream/60 mt-1">Sustain focus & flow</p>
                            </button>
                            
                            <button 
                                onClick={() => setSelectedGoal('dissonance')}
                                className={`p-4 rounded-xl border-2 text-left transition-all ${selectedGoal === 'dissonance' ? 'border-primary bg-primary/10' : 'border-cream/10 hover:border-cream/30'}`}
                            >
                                <div className="font-bold text-primary flex items-center gap-2">
                                    <span className="material-symbols-outlined">psychology</span> Dissonance
                                </div>
                                <p className="text-xs text-cream/60 mt-1">Break the pattern</p>
                            </button>
                        </div>
                    </div>

                    <button 
                        onClick={handleGenerate}
                        disabled={!sessionInput.trim()}
                        className="w-full h-14 rounded-xl bg-coral flex items-center justify-center text-indigo font-bold text-lg hover:bg-white hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                    >
                        Analyze & Generate
                    </button>
                  </div>
               </div>
            )}

            {/* Metadata Loading State */}
            {isLoadingMetadata && (
                <div className="flex flex-col items-center justify-center grow gap-6">
                    <div className="relative w-32 h-32">
                        <div className="absolute inset-0 border-4 border-cream/10 rounded-full"></div>
                        <div className="absolute inset-0 border-4 border-t-teal border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
                        <div className="absolute inset-0 flex items-center justify-center flex-col gap-1">
                            <span className="material-symbols-outlined text-4xl animate-pulse text-teal">psychology</span>
                        </div>
                    </div>
                    <div className="text-center">
                        <p className="text-xl font-bold">Analyzing Psychometrics...</p>
                        <p className="text-sm text-cream/60 mt-2">Mapping DISC Profile & Big Five Traits</p>
                    </div>
                </div>
            )}

            {/* Results Section */}
            {songData && !isLoadingMetadata && (
                <div className="flex flex-col gap-8 w-full max-w-5xl mx-auto">
                    
                    {/* PSYCHOMETRIC SCROLLERS */}
                    <div className="w-full flex flex-col gap-6">
                        {/* 1. Speech Transcript Analysis (Shows initially, stays visible unless playing music overrides it?) 
                            Let's stack them or swap them based on playback state for clarity. 
                            User request: "add in a transcript... then when we play the music we want the same cleft"
                        */}
                        
                        {!isPlayingAudio ? (
                             <PsychometricScroller 
                                segments={songData.transcriptAnalysis} 
                                label="Input Analysis (Speech)"
                                speed="slow"
                             />
                        ) : (
                             <PsychometricScroller 
                                segments={songData.musicalAnalysis} 
                                label="Therapeutic Delivery (Music)"
                                speed="medium"
                                isActive={true}
                             />
                        )}
                    </div>

                    {/* Psych Analysis Report Summary */}
                    <div className="w-full bg-background-dark/50 border border-cream/10 rounded-2xl p-6 md:p-8 backdrop-blur-md">
                        <div className="flex items-center gap-2 mb-6">
                            <span className="material-symbols-outlined text-teal">analytics</span>
                            <h3 className="text-lg font-bold tracking-widest uppercase text-teal">Session Analysis</h3>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs uppercase text-cream/40 font-bold">Mood Profile</label>
                                    <p className="text-xl text-cream">{songData.analysis.moodProfile}</p>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-indigo/50 p-4 rounded-xl border border-cream/5">
                                        <label className="text-xs uppercase text-cream/40 font-bold">Big Five</label>
                                        <p className="text-sm text-yellow font-mono mt-1">{songData.analysis.bigFiveTraits}</p>
                                    </div>
                                    <div className="bg-indigo/50 p-4 rounded-xl border border-cream/5">
                                        <label className="text-xs uppercase text-cream/40 font-bold">DISC Type</label>
                                        <p className="text-sm text-primary font-mono mt-1">{songData.analysis.discProfile}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="flex flex-col justify-center">
                                <label className="text-xs uppercase text-cream/40 font-bold mb-2">Clinical Reasoning</label>
                                <p className="text-cream/80 italic border-l-2 border-cream/20 pl-4 py-1">
                                    "{songData.analysis.clinicalReasoning}"
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Band Visuals */}
                    <div className="flex flex-col gap-8 w-full">
                        <div className="grid grid-cols-3 gap-4 md:gap-8 max-w-3xl mx-auto w-full">
                            {MICE_MUSICIANS.map((musician, idx) => (
                                <MouseCard 
                                    key={musician.id} 
                                    musician={musician} 
                                    isPlaying={isPlayingAudio}
                                    isActive={true}
                                    bpm={songData.bpm}
                                />
                            ))}
                        </div>

                        {/* Song Details & Player */}
                        <div className="bg-indigo/40 backdrop-blur-sm rounded-3xl p-8 w-full border border-cream/10 relative overflow-hidden">
                            
                            {/* Audio Generation Loader Overlay */}
                            {isGeneratingAudio && (
                                <div className="absolute inset-0 bg-indigo/80 backdrop-blur-md z-20 flex flex-col items-center justify-center gap-4 animate-fade-in">
                                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-coral"></div>
                                    <p className="text-cream/80 font-bold animate-pulse">Synthesizing audio therapy...</p>
                                </div>
                            )}

                            <div className="text-center mb-8">
                                <h2 className="text-3xl md:text-5xl font-black text-coral mb-2">{songData.songTitle}</h2>
                                <h3 className="text-xl text-cream/60">by {songData.bandName}</h3>
                            </div>

                            {isPlayingAudio && <Visualizer bpm={songData.bpm} />}
                            
                            {!isPlayingAudio && !isGeneratingAudio && (
                                <div className="flex items-end justify-center gap-2 h-16 w-full max-w-[320px] mx-auto mb-6 opacity-30" aria-hidden="true">
                                    <div className="w-full h-[1px] bg-cream/50 self-center"></div>
                                </div>
                            )}

                            <div className="flex flex-col gap-6 text-center relative z-10">
                                {/* Only show static lyrics if music isn't playing, otherwise the scroller handles it? 
                                    Actually, user might want to see full lyrics. Let's keep them but maybe dim them.
                                */}
                                <div className={`space-y-2 font-serif text-lg md:text-xl italic text-cream/90 transition-opacity ${isPlayingAudio ? 'opacity-50' : 'opacity-100'}`}>
                                    {songData.lyrics.map((line, i) => (
                                        <p key={i} className="animate-fade-in" style={{animationDelay: `${i * 0.5}s`}}>
                                            " {line} "
                                        </p>
                                    ))}
                                </div>
                                
                                <div className="flex justify-center items-center mt-4">
                                    {!isPlayingAudio ? (
                                        <button 
                                            onClick={playAudio}
                                            disabled={isGeneratingAudio || !audioBuffer}
                                            className="h-20 w-20 rounded-full bg-coral flex items-center justify-center text-white shadow-lg hover:scale-110 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <span className="material-symbols-outlined text-5xl ml-2">play_arrow</span>
                                        </button>
                                    ) : (
                                        <button 
                                            onClick={stopAudio}
                                            className="h-20 w-20 rounded-full bg-background-light flex items-center justify-center text-background-dark shadow-lg hover:scale-110 active:scale-95 transition-all"
                                        >
                                            <span className="material-symbols-outlined text-5xl">stop</span>
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-center gap-4 pb-10">
                        <button 
                            onClick={handleReset}
                            className="px-8 py-3 rounded-full border border-cream/30 hover:bg-cream/10 transition-colors text-cream font-bold"
                        >
                            New Session
                        </button>
                    </div>
                </div>
            )}

          </div>
        )}
      </main>

      {/* Footer/Background */}
      <MusicStaff />
      
      <style>{`
        @keyframes fade-in {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        @keyframes fade-in-up {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
            animation: fade-in 1s ease-out forwards;
        }
        .animate-fade-in-up {
            animation: fade-in-up 0.8s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
