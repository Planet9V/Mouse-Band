
export interface PsychoAnalysis {
  moodProfile: string;
  bigFiveTraits: string;
  discProfile: string;
  clinicalReasoning: string;
}

export interface PsychometricSegment {
  text: string;
  label: string; // The detected trait, bias, or musical effect
  colorCode: string; // Hex code for visualization
  description?: string; // Short explanation
}

export interface SongData {
  bandName: string;
  songTitle: string;
  lyrics: string[];
  bpm: number;
  description: string;
  analysis: PsychoAnalysis;
  transcriptAnalysis: PsychometricSegment[]; // Breakdown of user's input
  musicalAnalysis: PsychometricSegment[]; // Breakdown of song structure/lyrics
}

export type SonicGoal = 'uplift' | 'trance' | 'dissonance';

export type Mood = "Happy" | "Melancholic" | "Energetic" | "Chill" | "Romantic" | "Spooky" | string;

export interface MouseMusician {
  id: string;
  name: string;
  instrument: string;
  imageUrl: string;
  color: string;
}
