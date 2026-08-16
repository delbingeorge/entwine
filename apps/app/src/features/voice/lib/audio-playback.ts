const outputRate = 24000;

export class AudioPlayback {
  private analyser: AnalyserNode | null = null;
  private context: AudioContext | null = null;
  private cursor = 0;
  private gain: GainNode | null = null;
  private playing: AudioBufferSourceNode[] = [];
  private samples = new Uint8Array(0);

  async ready() {
    this.context ??= new AudioContext({ sampleRate: outputRate });
    this.gain ??= this.context.createGain();

    if (this.analyser === null) {
      this.analyser = this.context.createAnalyser();
      this.analyser.fftSize = 512;
      this.samples = new Uint8Array(this.analyser.frequencyBinCount);
      this.gain.connect(this.analyser);
      this.analyser.connect(this.context.destination);
    }

    if (this.context.state === "suspended") {
      await this.context.resume();
    }

    return this.context;
  }

  /** Loudness of what is playing right now, roughly 0 to 1. */
  level() {
    if (this.analyser === null) {
      return 0;
    }

    this.analyser.getByteTimeDomainData(this.samples);

    let sum = 0;

    for (const sample of this.samples) {
      const centred = (sample - 128) / 128;
      sum += centred * centred;
    }

    return Math.min(1, Math.sqrt(sum / this.samples.length) * 3.2);
  }

  setMuted(isMuted: boolean) {
    if (this.gain !== null) {
      this.gain.gain.value = isMuted ? 0 : 1;
    }
  }

  play(pcm: ArrayBuffer, onDrained: () => void) {
    const context = this.context;

    if (context === null || pcm.byteLength === 0) {
      return;
    }

    const samples = new Int16Array(pcm);
    const buffer = context.createBuffer(1, samples.length, outputRate);
    const channel = buffer.getChannelData(0);

    for (let index = 0; index < samples.length; index++) {
      channel[index] = (samples[index] ?? 0) / 0x8000;
    }

    const node = context.createBufferSource();
    node.buffer = buffer;
    node.connect(this.gain ?? context.destination);

    this.cursor = Math.max(this.cursor, context.currentTime);
    node.start(this.cursor);
    this.cursor += buffer.duration;

    this.playing.push(node);
    node.onended = () => {
      this.playing = this.playing.filter((entry) => entry !== node);

      if (this.playing.length === 0) {
        onDrained();
      }
    };
  }

  /** Barge-in: drop everything queued so Ellie stops mid-sentence. */
  flush() {
    this.playing.forEach((node) => {
      node.onended = null;
      node.stop();
    });
    this.playing = [];
    this.cursor = 0;
  }

  async close() {
    this.flush();
    this.analyser?.disconnect();
    this.analyser = null;
    this.gain?.disconnect();
    this.gain = null;
    await this.context?.close();
    this.context = null;
  }
}
