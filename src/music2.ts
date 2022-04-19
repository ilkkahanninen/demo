const scheduledAudioNodes: AudioScheduledSourceNode[] = [];

export function initMusic() {
  const ctx = new AudioContext();
  const timed = toTriggerTimes(0.101);

  const kick = kickTrack(ctx, timed(euclidean(12, 32)));
  const hh = hihatTrack(ctx, timed(euclidean(32, 32)));
  const snare = snareTrack(ctx, timed(euclidean(4, 32)));

  kick.connect(ctx.destination);
  hh.connect(ctx.destination);
  snare.connect(ctx.destination);

  scheduledAudioNodes.forEach((n) => n.start());
}

function kickTrack(ctx: AudioContext, triggerTimes: number[]): AudioNode {
  const osc = ctx.createOscillator();
  osc.type = "square";

  const gain = ctx.createGain();
  gain.gain.value = 0;

  const filter = ctx.createBiquadFilter();
  filter.type = "lowpass";

  triggerTimes.forEach((time) => {
    osc.frequency.setValueCurveAtTime([250, 50, 25, 100], time, 0.1);
    gain.gain.setValueCurveAtTime([1, 0], time, 0.2);
    filter.frequency.setValueCurveAtTime([1000, 50], time, 0.1);
  });

  scheduledAudioNodes.push(osc);
  return osc.connect(gain).connect(filter);
}

function hihatTrack(ctx: AudioContext, triggerTimes: number[]): AudioNode {
  const bufferSize = 2 * ctx.sampleRate,
    noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate),
    output = noiseBuffer.getChannelData(0);

  for (let i = 0; i < bufferSize; i++) {
    output[i] = Math.random() * 2 - 1;
  }

  const whiteNoise = ctx.createBufferSource();
  whiteNoise.buffer = noiseBuffer;
  whiteNoise.loop = true;

  const filter = ctx.createBiquadFilter();
  filter.type = "bandpass";
  filter.frequency.value = 5000;
  filter.Q.value = 2;

  const gain = ctx.createGain();
  gain.gain.value = 0;

  triggerTimes.forEach((time) => {
    gain.gain.setValueCurveAtTime(
      [1, 0.1, 0.08, 0.06, 0.04, 0.02, 0],
      time,
      0.1
    );
  });

  scheduledAudioNodes.push(whiteNoise);
  return whiteNoise.connect(gain).connect(filter);
}

function snareTrack(ctx: AudioContext, triggerTimes: number[]): AudioNode {
  const bufferSize = 2 * ctx.sampleRate,
    noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate),
    output = noiseBuffer.getChannelData(0);

  for (let i = 0; i < bufferSize; i++) {
    output[i] = Math.random() * 2 - 1;
  }

  const whiteNoise = ctx.createBufferSource();
  whiteNoise.buffer = noiseBuffer;
  whiteNoise.loop = true;

  const filter = ctx.createBiquadFilter();
  filter.type = "bandpass";
  filter.frequency.value = 2000;
  filter.Q.value = 2;

  const gain = ctx.createGain();
  gain.gain.value = 0;

  triggerTimes.forEach((time) => {
    gain.gain.setValueCurveAtTime(
      [1, 0.1, 0.08, 0.06, 0.04, 0.02, 0],
      time,
      0.4
    );
  });

  scheduledAudioNodes.push(whiteNoise);
  return whiteNoise.connect(gain).connect(filter);
}

function euclidean(k: number, n: number): boolean[] {
  let bucket = 0;
  return Array(n)
    .fill(0)
    .map(() => {
      bucket += k;
      if (bucket < n) return false;
      bucket -= n;
      return true;
    });
}

const toTriggerTimes =
  (stepLength: number) =>
  (triggers: boolean[]): number[] =>
    triggers.flatMap((trigger, index) => (trigger ? [index * stepLength] : []));

// console.log(
//   euclidean(4, 32)
//     .map((n) => (n ? "x" : "."))
//     .join("")
// );
