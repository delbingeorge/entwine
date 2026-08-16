interface Note {
  at: number;
  frequency: number;
  length: number;
}

const peak = 0.11;
const attack = 0.014;

let context: AudioContext | null = null;

const audio = () => {
  context ??= new AudioContext();

  if (context.state === "suspended") {
    void context.resume();
  }

  return context;
};

const strike = (note: Note, startedAt: number) => {
  const output = audio();
  const at = startedAt + note.at;

  const gain = output.createGain();
  gain.connect(output.destination);
  gain.gain.setValueAtTime(0, at);
  gain.gain.linearRampToValueAtTime(peak, at + attack);
  gain.gain.exponentialRampToValueAtTime(0.0001, at + note.length);

  // Fundamental plus a quiet octave keeps it warm rather than thin.
  [
    { frequency: note.frequency, level: 1 },
    { frequency: note.frequency * 2, level: 0.22 },
  ].forEach((partial) => {
    const voice = output.createOscillator();
    const level = output.createGain();

    voice.type = "sine";
    voice.frequency.setValueAtTime(partial.frequency, at);
    level.gain.setValueAtTime(partial.level, at);

    voice.connect(level);
    level.connect(gain);
    voice.start(at);
    voice.stop(at + note.length + 0.05);
  });
};

const playPhrase = (notes: Note[]) => {
  const startedAt = audio().currentTime + 0.01;

  notes.forEach((note) => {
    strike(note, startedAt);
  });
};

/** Two notes rising a fifth: settled, not a ringtone. */
export const playJoinSound = () => {
  playPhrase([
    { at: 0, frequency: 523.25, length: 0.28 },
    { at: 0.09, frequency: 783.99, length: 0.42 },
  ]);
};

/** The same interval falling, a touch slower, to read as closing. */
export const playEndSound = () => {
  playPhrase([
    { at: 0, frequency: 659.25, length: 0.26 },
    { at: 0.11, frequency: 392.0, length: 0.5 },
  ]);
};
