export const play = () => {
  const ctx = new AudioContext();

  const osc = ctx.createOscillator();
  osc.type = "sine";
  osc.frequency.value = 55;
  osc.start();

  const velocity = ctx.createGain();
  velocity.gain.value = 0;

  const osc2 = ctx.createOscillator();
  osc2.type = "sine";
  osc2.frequency.value = 440;
  osc2.start();

  const fmFreq = ctx.createGain();
  fmFreq.gain.value = 440;

  const delay = ctx.createDelay();
  delay.delayTime.value = 0.5;
  const delayAttenuator = ctx.createGain();
  delayAttenuator.gain.value = 0.4;

  const fmSynthFilter = ctx.createBiquadFilter();
  fmSynthFilter.type = "highpass";
  fmSynthFilter.frequency.value = 500;
  fmSynthFilter.Q.value = 3.0;

  const kickOsc = ctx.createOscillator();
  kickOsc.type = "sine";
  kickOsc.start();
  const kickVCA = ctx.createGain();
  kickVCA.gain.value = 0;
  const kickFilter = ctx.createBiquadFilter();
  kickFilter.type = "lowpass";
  kickFilter.frequency.value = 1000;
  kickFilter.Q.value = 2;

  const hhGain = ctx.createGain();
  hhGain.gain.value = 0;
  for (let i = 0; i < 4; i++) {
    const hhOsc = ctx.createOscillator();
    hhOsc.type = "sine";
    hhOsc.frequency.value = 500 + i * i * 600;
    hhOsc.start();
    hhOsc.connect(hhGain);
  }

  const bufferSize = 2 * ctx.sampleRate,
    noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate),
    output = noiseBuffer.getChannelData(0);

  for (let i = 0; i < bufferSize; i++) {
    output[i] = Math.random() * 2 - 1;
  }

  // const whiteNoise = ctx.createBufferSource();
  // whiteNoise.buffer = noiseBuffer;
  // whiteNoise.loop = true;
  // whiteNoise.start();
  // const whiteNoiseVCA = ctx.createGain();
  // whiteNoiseVCA.gain.value = 0;

  const bassLead = ctx.createOscillator();
  bassLead.type = "sawtooth";
  bassLead.frequency.value = 55;
  bassLead.start();
  const bassLeadFilter = ctx.createBiquadFilter();
  bassLeadFilter.type = "lowpass";
  bassLeadFilter.Q.value = 1.5;
  bassLeadFilter.frequency.value = 0;
  const bassLeadVCA = ctx.createGain();
  bassLeadVCA.gain.value = 0.2;

  const compressor = ctx.createDynamicsCompressor();
  compressor.attack.value = 0.01;
  compressor.release.value = 0.4;
  compressor.knee.value = 0;
  compressor.ratio.value = 99.0;

  // const compGain = ctx.createGain();
  // compGain.gain.value = 2.0;

  // const compressor2 = ctx.createDynamicsCompressor();
  // compressor.attack.value = 0.02;
  // compressor.release.value = 0.3;
  // compressor.knee.value = 0.2;
  // compressor.ratio.value = 4.0;

  osc2.connect(fmFreq).connect(osc.frequency);
  osc.connect(velocity).connect(fmSynthFilter).connect(compressor);
  fmSynthFilter.connect(delay).connect(delayAttenuator).connect(compressor);
  delayAttenuator.connect(delay);
  kickOsc.connect(kickVCA).connect(kickFilter).connect(compressor);
  hhGain.connect(compressor);
  // whiteNoise.connect(hhGain);
  // whiteNoise.connect(whiteNoiseVCA);
  // whiteNoiseVCA.connect(compressor);
  // whiteNoiseVCA.connect(delay);
  bassLead.connect(bassLeadFilter).connect(bassLeadVCA).connect(compressor);
  compressor /*.connect(compGain).connect(compressor2)*/
    .connect(ctx.destination);

  const scheduleNote = (step: number, time: number) => {
    const currentTime = ctx.currentTime + time;

    kickOsc.frequency.setValueCurveAtTime([110, 40, 10, 55], currentTime, 0.2);
    kickVCA.gain.setValueCurveAtTime([0, 1, 0.05, 0.1, 0.5], currentTime, 0.1);
    kickFilter.frequency.setValueCurveAtTime([1000, 10], currentTime, 0.1);

    osc.frequency.exponentialRampToValueAtTime(
      25.5 * Math.pow(2, step % 4),
      currentTime
    );
    osc2.frequency.exponentialRampToValueAtTime(
      55.5 * Math.pow(2, step % 3),
      currentTime
    );

    fmSynthFilter.frequency.exponentialRampToValueAtTime(
      1000 + 200 * (Math.floor(step / 4) % 4) - 100 * Math.sin(step),
      currentTime
    );

    hhGain.gain.setValueCurveAtTime([0.006, 0], currentTime + 0.1, 0.01);
    hhGain.gain.setValueCurveAtTime([0.008, 0], currentTime + 0.2, 0.02);
    hhGain.gain.setValueCurveAtTime([0.006, 0], currentTime + 0.3, 0.01);

    // if (step % 4 == 1) {
    //   whiteNoiseVCA.gain.setValueCurveAtTime(
    //     [0.01, 0.001, 0, 0.01, 0],
    //     currentTime + 0.2,
    //     0.4
    //   );
    // }

    bassLead.frequency.exponentialRampToValueAtTime(
      55 + (step % 4) + (step % 3 == 1 ? 8 : 0),
      currentTime + 0.2
    );
    bassLeadFilter.frequency.setValueCurveAtTime(
      [1110, 0],
      currentTime + 0.2,
      0.1
    );
    bassLeadVCA.gain.setValueCurveAtTime(
      [0, 0.02, 0.01, 0.05, 0],
      currentTime + 0.2,
      0.1
    );

    velocity.gain.setValueCurveAtTime([0.2, 0, 0.1, 0], currentTime, 0.2);

    // osc.type = "sine";
    if (step % 2 == 0) {
      // osc.type = "triangle";
      fmFreq.gain.setValueCurveAtTime([880.0, 25.5], currentTime, 0.2);
    } else if (step % 4 == 0) {
      fmFreq.gain.setValueCurveAtTime(
        [440.0 * Math.pow(2, step % 4), 0],
        currentTime,
        0.2
      );
    }
  };

  const lookahead = 1;
  const scheduleAheadTime = 0.1;
  let currentNote = 0;
  let nextNoteTime = 0;

  const nextNote = () => {
    nextNoteTime += 0.2;
    currentNote = (currentNote + 1) % 32;
  };

  const scheduler = () => {
    while (nextNoteTime < ctx.currentTime + scheduleAheadTime) {
      scheduleNote(currentNote, nextNoteTime);
      nextNote();
    }
    setTimeout(scheduler, lookahead);
  };

  nextNoteTime = ctx.currentTime;
  scheduler();
};
