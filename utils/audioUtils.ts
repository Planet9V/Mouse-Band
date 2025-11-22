
export const decodeBase64 = (base64: string): Uint8Array => {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
};

export const pcmToAudioBuffer = async (
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number = 24000
): Promise<AudioBuffer> => {
  // The data is raw PCM 16-bit little endian, mono.
  const int16View = new Int16Array(data.buffer);
  const float32View = new Float32Array(int16View.length);
  
  for (let i = 0; i < int16View.length; i++) {
    // Normalize 16-bit integer to float range [-1.0, 1.0]
    float32View[i] = int16View[i] / 32768.0;
  }

  // Create an AudioBuffer (1 channel, derived length, sampleRate)
  const audioBuffer = ctx.createBuffer(1, float32View.length, sampleRate);
  audioBuffer.copyToChannel(float32View, 0);
  
  return audioBuffer;
};
