import { config } from "./config";
import {
  SegmentCtor,
  add,
  assignSegments,
  barCalculator,
  beatCalculator,
  concat,
  cos,
  fft,
  hold,
  linear,
  loop,
  mergeSegments,
  repeat,
  sampleAndHold,
  sin,
  vector,
} from "./scripting/index";
import { testFft } from "./testFft";

const beats = beatCalculator(config.bpm);
const bars = barCalculator(config.bpm, 4);

const beat = beats(1);
const bar = bars(1);

// Environment geometry

const onlyLights = hold(0);
const tunnel = hold(1);
const pesurumpu = hold(2);

// Main script

const zero = hold(0);
const disabled = zero;
const enabled = hold(1);

// Materials

const beatenUpMetal = hold(0);
const rustingLinedMetal = hold(1);
const stainlessSteel = hold(2);

// Shaders

const palloShader = hold(0);
const jokuMuotoShader = hold(1);

// Overlays

const overlays = {
  none: -1,

  listen: 0,
  youNeedToUnderstand: 1,
  lifeIsImportant: 2,
  technoIsImportant: 3,
  butThereIsSomethingMoreImportant: 4,

  we: 5,
  need: 6,
  toDo: 7,
  some: 8,
  laundry: 9,

  symbol1a: 10,
  symbol1b: 11,
  symbol1c: 12,
  symbol1d: 13,
  symbol2a: 14,
  symbol2b: 15,
  symbol2c: 16,
  symbol2d: 17,
  symbol3a: 18,
  symbol3b: 19,
  symbol3c: 20,
  symbol3d: 21,
  symbol4a: 22,
  symbol4b: 23,
  symbol4c: 24,
  symbol4d: 25,

  rinseAndRepeat: 26,
  credits01: 27,
  credits02: 28,
  thankYou: 29,
};

const overlayFx = (duration: number) =>
  concat(linear(1.0, 0.015)(duration / 2), linear(0.015, 1.0)(duration / 2));

const overlay = (index: number, length: number) =>
  assignSegments({
    texture: hold(index)(length),
    fx: overlayFx(length),
  });

// Part: 1

const percPattern = <T>(seg1: SegmentCtor<T>, seg2: SegmentCtor<T>) =>
  concat(
    seg1(beat),
    seg2(beat)
    // seg1(beat * 0.5),
    // seg2(beat * 0.5),
    // seg1(beat * 0.25),
    // seg2(beat * 0.75)
  );

const tunnelCam = (duration: number) =>
  assignSegments({
    pos: vector(sin(0.3, 0.1), sin(10, 0.002), cos(0.3, 0.1))(duration),
    lookAt: vector(sin(1, 0.2), cos(1, 0.21), sin(1, 0.12))(duration),
    up: vector(sin(1, 0.1), hold(0), cos(1, 0.1))(duration),
    fov: sampleAndHold(beat, add(120)(sin(50, 999))(duration)),
  });

const partTunnel = (duration: number) =>
  assignSegments({
    camera: tunnelCam(duration),
    envGeometry: pesurumpu(duration),
    envFactor: zero(duration),
    lightCount: concat(hold(2)(duration / 2), hold(3)(duration / 2)),
    object: concat(
      hold(0)(duration / 4),
      hold(1)(duration / 4),
      hold(2)(duration / 4),
      hold(3)(duration / 4)
    ),
    material: concat(
      rustingLinedMetal(duration / 2),
      beatenUpMetal(duration / 2)
    ),
    shader: palloShader(duration),
    lightIntensity: repeat(128, linear(10, 0.1)(duration / 128)),
    distanceColorFx: fft(testFft),
    noise: repeat(1024, linear(0.5, 0)(duration / 1024)),
    timeModifier: loop(64, (i) =>
      percPattern(hold(i * 2.7), hold((i + 0.5) * 2.7))
    ),
    postEffect: repeat(32, linear(0, 2)(duration / 32)),
  });

const testing = (duration: number) =>
  assignSegments({
    camera: assignSegments({
      pos: vector(hold(0.0), cos(2.0, 0.1), sin(2.0, 0.1))(duration),
      lookAt: vector(hold(1.0), hold(0.0), hold(0.0))(duration),
      up: vector(hold(0), hold(0), hold(1))(duration),
      fov: hold(60)(duration),
    }),
    envGeometry: pesurumpu(duration),
    envFactor: zero(duration),
    lightCount: concat(hold(2)(duration / 2), hold(3)(duration / 2)),
    object: hold(0)(duration),
    material: concat(
      rustingLinedMetal(duration / 2),
      beatenUpMetal(duration / 2)
    ),
    shader: palloShader(duration),
    lightIntensity: hold(50)(duration),
    distanceColorFx: hold(0)(duration),
    noise: hold(0)(duration),
    timeModifier: hold(0)(duration),
    postEffect: hold(0)(duration),
  });

const overlayScript = concat(
  overlay(overlays.none, bars(24)),

  // Listen, you need to understand...
  repeat(
    3,
    concat(
      overlay(overlays.none, beats(1)),
      overlay(overlays.listen, beats(1)),
      overlay(overlays.none, beats(6))
    )
  ),
  overlay(overlays.none, beats(0.5)),
  overlay(overlays.youNeedToUnderstand, beats(3.5)),
  overlay(overlays.none, bars(1)),

  // Life is important etc.
  overlay(overlays.none, beats(1)),
  overlay(overlays.lifeIsImportant, beats(7)),

  overlay(overlays.none, beats(0.5)),
  overlay(overlays.technoIsImportant, beats(7.5)),

  overlay(overlays.none, beats(1)),
  overlay(overlays.butThereIsSomethingMoreImportant, beats(11)),
  overlay(overlays.none, beats(2.75)),
  // huom. tästä kohtaa tarkoituksella puuttuu 1.25 iskua

  // We need to do some laundry
  repeat(
    8,
    concat(
      overlay(overlays.we, beats(1)),
      overlay(overlays.need, beats(0.25)),
      overlay(overlays.toDo, beats(1)),
      overlay(overlays.some, beats(0.75)),
      overlay(overlays.laundry, beats(1)),
      overlay(overlays.none, beats(4))
    )
  ),
  overlay(overlays.none, beats(1.25)),

  // Laundry symbols
  overlay(overlays.none, beats(1)),
  overlay(overlays.symbol1a, beats(7)),
  overlay(overlays.none, beats(1)),
  overlay(overlays.symbol1b, beats(7)),
  overlay(overlays.none, beats(1)),
  overlay(overlays.symbol1c, beats(7)),
  overlay(overlays.none, beats(5)),
  overlay(overlays.symbol1d, beats(3)),

  overlay(overlays.none, beats(1)),
  overlay(overlays.symbol2a, beats(7)),
  overlay(overlays.none, beats(1)),
  overlay(overlays.symbol2b, beats(7)),
  overlay(overlays.none, beats(1)),
  overlay(overlays.symbol2c, beats(7)),
  overlay(overlays.none, beats(5)),
  overlay(overlays.symbol2d, beats(3)),

  overlay(overlays.none, beats(1)),
  overlay(overlays.symbol3a, beats(7)),
  overlay(overlays.none, beats(1)),
  overlay(overlays.symbol3b, beats(7)),
  overlay(overlays.none, beats(1)),
  overlay(overlays.symbol3c, beats(7)),
  overlay(overlays.none, beats(5)),
  overlay(overlays.symbol3d, beats(3)),

  overlay(overlays.none, beats(1)),
  overlay(overlays.symbol4a, beats(7)),
  overlay(overlays.none, beats(1)),
  overlay(overlays.symbol4b, beats(7)),
  overlay(overlays.none, beats(1)),
  overlay(overlays.symbol4c, beats(7)),
  overlay(overlays.none, beats(5)),
  overlay(overlays.symbol4d, beats(3) + bars(2)),

  // Rinse and repeat
  repeat(
    3,
    concat(
      overlay(overlays.none, beats(5)),
      overlay(overlays.rinseAndRepeat, beats(3))
    )
  ),

  // Teknotauko
  overlay(overlays.none, bars(16)),

  // Lopputekstit
  overlay(overlays.credits01, bars(4)),
  overlay(overlays.credits02, bars(4)),
  overlay(overlays.none, bars(1)),
  overlay(overlays.thankYou, bars(3))
);

export const script = mergeSegments(
  concat(
    //testing(bars(32)),
    partTunnel(bars(32))
  ),
  assignSegments({
    overlay: overlayScript,
  })
);
