const scale = [0, 2, 4, 7, 9];

export function play() {
  const ctx = new AudioContext();

  const [osc, oscOut] = createSequenceNode(ctx, "square", [-2, -1], scale);
  const [osc2, oscOut2] = createSequenceNode(ctx, "sawtooth", [0], scale);
  const [osc3, oscOut3] = createSequenceNode(ctx, "sine", [0, 1], scale);
  const [osc4, oscOut4] = createSequenceNode(ctx, "sine", [-2, 2], scale);

  const mixer = new ChannelMergerNode(ctx, {
    numberOfInputs: 16,
    channelCount: 1,
  });

  const delay = delayCloud(ctx, mixer);

  oscOut.connect(mixer);
  oscOut2.connect(mixer);
  oscOut3.connect(mixer);
  oscOut4.connect(mixer);
  delay.connect(mixer);
  mixer.connect(ctx.destination);

  osc.start();
  osc2.start();
  osc3.start();
  osc4.start();
}

function delayCloud(ctx: AudioContext, input: AudioNode) {
  const delayTimes = [0.125, 0.25, 0.5, 0.75, 1.0];

  const mixer = new ChannelMergerNode(ctx, {
    numberOfInputs: delayTimes.length * 2,
    channelCount: 1,
  });

  delayTimes.forEach((time) => {
    const delay = ctx.createDelay();
    delay.delayTime.value = time;

    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.Q.value = 3;
    filter.frequency.setValueCurveAtTime(
      Array(120)
        .fill(0)
        .map(() => Math.random() * 16000),
      0,
      120
    );

    const delayGain = ctx.createGain();
    delayGain.gain.value = 0.1;

    input.connect(delay).connect(delayGain).connect(filter).connect(mixer);
  });

  return mixer;
}

function createSequenceNode(
  ctx: AudioContext,
  type: OscillatorType,
  octaves: number[],
  scale: number[]
): [OscillatorNode, GainNode] {
  let freqs = octaves
    .flatMap((oct) => scale.map((n) => oct * 12 + n))
    .map((n) => 440 * Math.pow(2, n / 12));
  let times = [0.25, 0.25, 0.25, 0.25, 0.5, 0.5, 1, 1, 2, 2, 4];

  const osc = ctx.createOscillator();
  osc.type = type;
  const oscGain = ctx.createGain();
  const filter = ctx.createBiquadFilter();
  filter.Q.value = 1.2;
  filter.type = "lowpass";

  let t = 0;
  shuffleInPlace(freqs);
  shuffleInPlace(times);

  for (let i = 0; i < 120; i++) {
    if (i % freqs.length === 0) shuffleInPlace(freqs);
    if (i % times.length === 0) shuffleInPlace(times);

    const duration = times[i % times.length];
    console.log(t);
    osc.frequency.setValueAtTime(freqs[i % freqs.length], ctx.currentTime + t);
    oscGain.gain.setValueCurveAtTime(
      [1, 0.25, 0.1, 0.05, 0.25, 0.125, 0],
      t,
      duration
    );
    filter.frequency.setValueCurveAtTime(
      [10000, 1000, 500, 1000, 0],
      t,
      duration / 2
    );
    t += duration;
  }

  osc.connect(filter).connect(oscGain);

  return [osc, oscGain];
}

const shuffleInPlace = <T>(arr: T[]): T[] =>
  arr.sort(() => Math.random() - 0.5);
