const source = `
class PcmCapture extends AudioWorkletProcessor {
  constructor() {
    super();
    this.buffer = new Int16Array(640);
    this.filled = 0;
  }

  process(inputs) {
    const input = inputs[0] && inputs[0][0];

    if (!input) {
      return true;
    }

    for (let index = 0; index < input.length; index++) {
      const clamped = Math.max(-1, Math.min(1, input[index]));
      this.buffer[this.filled++] = clamped < 0 ? clamped * 0x8000 : clamped * 0x7fff;

      if (this.filled === this.buffer.length) {
        this.port.postMessage(this.buffer.slice(0));
        this.filled = 0;
      }
    }

    return true;
  }
}

registerProcessor("pcm-capture", PcmCapture);
`;

export const captureWorkletUrl = () =>
  URL.createObjectURL(new Blob([source], { type: "application/javascript" }));
