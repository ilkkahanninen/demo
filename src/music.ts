const notes = [
  0,null,null ,3,null,null,2,null,
  -2,null,-2,null,2,null,5,null,
  3,5,null,7,null,null,null,10,
  10,8,null,8,null,null,7,null,
  5,null,7,8,null,10,null,10,
  null,null,10,null,null,10,null,null,
  10,null,null,10,null,null,10,null,
  // null,null,null,null,null,null,null,null,
  -14,null,null,-9,null,null,-10,null,
]

export let play = () => {
  let ctx = new AudioContext();
  // return ctx;

  let theme = ctx.createOscillator();
  theme.type = "square";
  theme.frequency.value = 440;
  theme.start();

  let themeFilter = ctx.createBiquadFilter()
  themeFilter.Q.value = 2.0
  themeFilter.frequency.value = 0

  let themeGain = ctx.createGain();
  themeGain.gain.value = 0.2;
  
  let osc = ctx.createOscillator();
  osc.type = "sine";
  osc.frequency.value = 55;
  osc.start();

  let velocity = ctx.createGain();
  velocity.gain.value = 0;

  let osc2 = ctx.createOscillator();
  osc2.type = "sine";
  osc2.frequency.value = 440;
  osc2.start();

  let fmFreq = ctx.createGain();
  fmFreq.gain.value = 440;

  let delay = ctx.createDelay();
  delay.delayTime.value = 0.4;
  let delayAttenuator = ctx.createGain();
  delayAttenuator.gain.value = 0.4;

  let fmSynthFilter = ctx.createBiquadFilter();
  fmSynthFilter.type = "highpass";
  fmSynthFilter.frequency.value = 500;
  fmSynthFilter.Q.value = 3;

  let kickOsc = ctx.createOscillator();
  kickOsc.type = "sine";
  kickOsc.start();
  let kickVCA = ctx.createGain();
  kickVCA.gain.value = 0;
  let kickFilter = ctx.createBiquadFilter();
  kickFilter.type = "lowpass";
  kickFilter.frequency.value = 1000;
  kickFilter.Q.value = 2;

  let hhGain = ctx.createGain();
  hhGain.gain.value = 0;
  for (let i = 0; i < 4; i++) {
    let hhOsc = ctx.createOscillator();
    hhOsc.type = "sine";
    hhOsc.frequency.value = 440 + i * i * 567;
    hhOsc.start();
    hhOsc.connect(hhGain);
  }

  // let bufferSize = 2 * ctx.sampleRate,
  //   noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate),
  //   output = noiseBuffer.getChannelData(0);

  // for (let i = 0; i < bufferSize; i++) {
  //   output[i] = Math.random() * 2 - 1;
  // }

  // let whiteNoise = ctx.createBufferSource();
  // whiteNoise.buffer = noiseBuffer;
  // whiteNoise.loop = true;
  // whiteNoise.start();
  // let whiteNoiseVCA = ctx.createGain();
  // whiteNoiseVCA.gain.value = 0;

  // let bassLead = ctx.createOscillator();
  // bassLead.type = "sawtooth";
  // bassLead.frequency.value = 55;
  // bassLead.start();
  // let bassLeadFilter = ctx.createBiquadFilter();
  // bassLeadFilter.type = "lowpass";
  // bassLeadFilter.Q.value = 1.5;
  // bassLeadFilter.frequency.value = 0;
  // let bassLeadVCA = ctx.createGain();
  // bassLeadVCA.gain.value = 0.2;

  let compressor = ctx.createDynamicsCompressor();
  compressor.threshold.value = -50;
  compressor.knee.value = 40;
  compressor.attack.value = 0;
  compressor.release.value = 0.1;
  compressor.ratio.value = 12;

  let compGain = ctx.createGain();
  compGain.gain.value = 2;

  // let compressor2 = ctx.createDynamicsCompressor();
  // compressor.attack.value = 0.02;
  // compressor.release.value = 0.3;
  // compressor.knee.value = 0.2;
  // compressor.ratio.value = 4.0;

  let masterFilter = ctx.createBiquadFilter();
  masterFilter.type = "lowpass";

  theme.connect(themeFilter).connect(themeGain).connect(delay);
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
  // bassLead.connect(bassLeadFilter).connect(bassLeadVCA).connect(compressor);
  compressor
    .connect(masterFilter)
    .connect(compGain) /*.connect(compressor2)*/
    .connect(ctx.destination);

  let scheduleNote = (tick: number, time: number) => {
    let step = Math.floor(tick / 2)
    let currentTime = ctx.currentTime + time;

    if (step >= 64) {
      const note = notes[tick % notes.length]
      if (note !== null) {
        let coef = (tick-64) / 512
        theme.frequency.setValueAtTime(220 * Math.pow(2, note / 12), currentTime)
        themeFilter.frequency.setValueCurveAtTime([8000 * coef, 110 * coef],
          currentTime,
          0.1)
        themeGain.gain.setValueCurveAtTime([0.1, 0],
          currentTime,
          0.1)
      } else {
        themeGain.gain.setValueAtTime(0, currentTime)
      }
    }

    if (tick % 2 !== 0) return

    if (step % 32 != 31) {
      kickOsc.frequency.setValueCurveAtTime(
        [110, 40, 10, 55],
        currentTime,
        0.2
      );
      kickVCA.gain.setValueCurveAtTime(
        [0, 1, 0.05, 0.1, 0.5],
        currentTime,
        0.1
      );
      kickFilter.frequency.setValueCurveAtTime([1000, 10], currentTime, 0.1);
    }

    osc.frequency.exponentialRampToValueAtTime(
      25.5 * Math.pow(2, step % 4),
      currentTime
    );
    osc2.frequency.exponentialRampToValueAtTime(
      55.5 * Math.pow(2, step % 3),
      currentTime
    );

    if (step >= 32) {
      hhGain.gain.setValueCurveAtTime([0.006, 0], currentTime + 0.1, 0.01);
      hhGain.gain.setValueCurveAtTime([0.006, 0], currentTime + 0.3, 0.01);
    }
    hhGain.gain.setValueCurveAtTime([0.008, 0], currentTime + 0.2, 0.02);

    // if (step % 4 == 1) {
    //   whiteNoiseVCA.gain.setValueCurveAtTime(
    //     [0.01, 0.001, 0, 0.01, 0],
    //     currentTime + 0.2,
    //     0.4
    //   );
    // }

    // if (step >= 64) {
    //   bassLead.frequency.exponentialRampToValueAtTime(55, currentTime + 0.2);
    //   bassLeadFilter.frequency.setValueCurveAtTime(
    //     [880, 0],
    //     currentTime + 0.2,
    //     0.1
    //   );
    //   bassLeadVCA.gain.setValueCurveAtTime(
    //     [0, 0.02, 0.01, 0.05, 0],
    //     currentTime + 0.2,
    //     0.1
    //   );
    // }

    if (step >= 32) {
      velocity.gain.setValueCurveAtTime(
        [0.01, 0, 0.1, 0].map((v) => v * Math.min((step - 32) / 64, 1)),
        currentTime + 0.2,
        0.2
      );

      // osc.type = "sine";
      if (step % 2 == 0) {
        // osc.type = "triangle";
        fmFreq.gain.setValueCurveAtTime([1600, 25.5], currentTime + 0.2, 0.2);
      } else if (step % 4 == 0) {
        fmFreq.gain.setValueCurveAtTime([440, 0], currentTime + 0.2, 0.2);
      }

      fmSynthFilter.frequency.exponentialRampToValueAtTime(
        1000 + 200 * (Math.floor(step / 4) % 4), // - 100 * Math.sin(step),
        currentTime
      );
    }
  };

  for (let i = 0; i < 1024; i++) {
    scheduleNote(i, i * 0.2);
  }

  masterFilter.frequency.setValueCurveAtTime(
    [0.1, 16000],
    0,
    12.8 /* 0.4 * 32 */
  );
  masterFilter.frequency.setValueCurveAtTime(
    [16000, 0.1],
    89.6 /* 0.4 * 224 */,
    12.8 /* 0.4 * 32 */
  );

  return ctx;
};
