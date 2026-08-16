const outputRate = 24000;

export class AudioPlayback {
  private context: AudioContext | null = null;
  private cursor = 0;
  private gain: GainNode | null = null;
  private playing: AudioBufferSourceNode[] = [];

  async ready() {
    this.context ??= new AudioContext({ sampleRate: outputRate });
    this.gain ??= this.context.createGain();
    this.gain.connect(this.context.destination);

    if (this.context.state === "suspended") {
      await this.context.resume();
    }

    return this.context;
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
    this.gain?.disconnect();
    this.gain = null;
    await this.context?.close();
    this.context = null;
  }
}
