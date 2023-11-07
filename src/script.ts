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

const noTexture = -1;
const overlayX = 0;
const overlayO = 1;
const overlaySquare = 2;
const overlayTriangle = 3;

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
    overlay: repeat(
      32,
      concat(
        overlay(overlayX, beat),
        overlay(overlayO, beat),
        overlay(overlaySquare, beat),
        overlay(overlayTriangle, beat)
      )
    ),
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
    overlay: overlay(noTexture, duration),
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

export const script = concat(
  //testing(bars(32)),
  partTunnel(bars(32))
);
