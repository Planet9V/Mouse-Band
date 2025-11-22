
import { GoogleGenAI, Type, Schema, Modality } from "@google/genai";
import { SongData, SonicGoal } from "../types";

// Ensure API key is available
const apiKey = process.env.API_KEY || "";

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey });

const songSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    bandName: {
      type: Type.STRING,
      description: "A creative, punny band name for a band of mice based on the genre/mood.",
    },
    songTitle: {
      type: Type.STRING,
      description: "A catchy song title.",
    },
    lyrics: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "A short 4-line verse or chorus for the song.",
    },
    bpm: {
      type: Type.INTEGER,
      description: "The beats per minute for the song, between 60 and 200.",
    },
    description: {
      type: Type.STRING,
      description: "A short, one-sentence enthusiastic description of the vibe.",
    },
    analysis: {
      type: Type.OBJECT,
      properties: {
        moodProfile: { type: Type.STRING, description: "Summary of the user's detected emotional state." },
        bigFiveTraits: { type: Type.STRING, description: "Key Big Five personality traits detected." },
        discProfile: { type: Type.STRING, description: "Estimated DISC profile." },
        clinicalReasoning: { type: Type.STRING, description: "Scientific explanation of the therapeutic goal." }
      },
      required: ["moodProfile", "bigFiveTraits", "discProfile", "clinicalReasoning"]
    },
    transcriptAnalysis: {
        type: Type.ARRAY,
        description: "Break down the user's input into chunks and assign a psychometric tag to each.",
        items: {
            type: Type.OBJECT,
            properties: {
                text: { type: Type.STRING, description: "The segment of user speech." },
                label: { type: Type.STRING, description: "The specific bias, trait (Big 5/DISC), or emotion detected." },
                colorCode: { type: Type.STRING, description: "A hex color representing this emotion/trait (e.g. Red for Anger/Dominance, Blue for Sadness/Compliance)." }
            },
            required: ["text", "label", "colorCode"]
        }
    },
    musicalAnalysis: {
        type: Type.ARRAY,
        description: "Break down the generated song lyrics or musical moments into chunks and assign the intended therapeutic effect.",
        items: {
            type: Type.OBJECT,
            properties: {
                text: { type: Type.STRING, description: "The lyric line or musical description." },
                label: { type: Type.STRING, description: "The therapeutic effect or psychometric shift being induced (e.g. 'Dopamine Release', 'Cognitive Reframing')." },
                colorCode: { type: Type.STRING, description: "A hex color representing this effect." }
            },
            required: ["text", "label", "colorCode"]
        }
    }
  },
  required: ["bandName", "songTitle", "lyrics", "bpm", "description", "analysis", "transcriptAnalysis", "musicalAnalysis"],
};

export const generateSongFromSession = async (input: string, goal: SonicGoal): Promise<SongData> => {
  if (!apiKey) {
    // Fallback if no API key is present for demo purposes
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          bandName: "The Placebo Effects",
          songTitle: "Simulation Theory (Demo)",
          lyrics: [
            "Analyzing waves in the digital sea",
            "Searching for the pulse of reality",
            "Data streams flowing through my mind",
            "Leaving the analog world behind"
          ],
          bpm: 110,
          description: "A synthetic pop track generated without an API key.",
          analysis: {
            moodProfile: "Simulated Neutrality",
            bigFiveTraits: "N/A (Demo)",
            discProfile: "N/A (Demo)",
            clinicalReasoning: "Demo mode activated."
          },
          transcriptAnalysis: [
            { text: "I'm feeling a bit", label: "Hesitation", colorCode: "#FFD166" },
            { text: "overwhelmed", label: "High Neuroticism", colorCode: "#EF476F" },
            { text: "with work", label: "External Stressor", colorCode: "#118AB2" }
          ],
          musicalAnalysis: [
            { text: "Analyzing waves", label: "Cognitive Focus", colorCode: "#06D6A0" },
            { text: "Digital sea", label: "Metaphorical Distance", colorCode: "#118AB2" }
          ]
        });
      }, 1500);
    });
  }

  const goalPrompts = {
    uplift: "The user needs to be pulled out of their current state into a positive, energetic headspace.",
    trance: "The user wants to stabilize their current focus and enter a flow state. Maintain the vibe but deepen it.",
    dissonance: "The user needs a 'pattern interrupt'. Break their current mood with something unexpected or jarringly different."
  };

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `
        You are an expert Music Therapist and Psychoanalyst.
        
        Analyze the following user statement/stream of consciousness:
        "${input}"

        YOUR TASKS:
        1. **Transcript Analysis**: Break the user's speech into segments. For each segment, identify specific Big Five traits, DISC profiles, cognitive biases, or emotional states. Assign a color code to visualize this "cleft" in their psyche.
        2. **Clinical Strategy**: Determine the therapeutic goal: **${goal.toUpperCase()}**. ${goalPrompts[goal]}
        3. **Musical Composition**: Create a song (performed by a band of mice) to achieve this goal.
        4. **Musical Analysis**: For the generated lyrics/composition, explain what psychometric effect each part is intended to invoke (e.g., "Inducing Alpha Waves", "Boosting Extraversion").

        Be scientific yet creative.
      `,
      config: {
        responseMimeType: "application/json",
        responseSchema: songSchema,
        temperature: 0.8,
      },
    });

    const text = response.text;
    if (!text) {
        throw new Error("No response from Gemini");
    }
    const data = JSON.parse(text) as SongData;
    return data;
  } catch (error) {
    console.error("Error generating song metadata:", error);
    return {
      bandName: "The Error Rats",
      songTitle: "Connection Lost Blues",
      lyrics: [
        "Tried to connect but the wire was cut",
        "Now I'm stuck in a digital rut",
        "Refresh the page and try again",
        "We'll make music, just tell me when!"
      ],
      bpm: 80,
      description: "A slow, sad ballad about internet connectivity issues.",
      analysis: {
        moodProfile: "Frustrated",
        bigFiveTraits: "Unknown",
        discProfile: "Unknown",
        clinicalReasoning: "Service unavailable."
      },
      transcriptAnalysis: [],
      musicalAnalysis: []
    };
  }
};

export const generateSongAudio = async (songData: SongData): Promise<string | null> => {
    if (!apiKey) return null;

    try {
        // Use gemini-2.5-flash-preview-tts for Text-to-Speech generation
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-preview-tts",
            contents: {
                parts: [{
                    text: `
                        Perform the following lyrics with a ${songData.description} style.
                        
                        ${songData.lyrics.join("\n")}
                    `
                }]
            },
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: {
                    voiceConfig: {
                        prebuiltVoiceConfig: { voiceName: 'Puck' }
                    }
                }
            }
        });

        const audioData = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        return audioData || null;

    } catch (error) {
        console.error("Error generating audio:", error);
        return null;
    }
};
