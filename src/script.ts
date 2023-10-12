import { config } from "./config";
import {
  SegmentCtor,
  assignSegments,
  barCalculator,
  beatCalculator,
  concat,
  cos,
  hold,
  linear,
  loop,
  repeat,
  sin,
  vector,
} from "./scripting/index";

const beats = beatCalculator(config.bpm);
const bars = barCalculator(config.bpm, 4);

const beat = beats(1);
const bar = bars(1);

// Environment geometry

const onlyLights = hold(0);
const tunnel = hold(1);
const hommeli = hold(2);
const glitch = hold(3);
const glitch2 = hold(4);

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
const realtimePhong = 0;
const jumalautaTex = 1;
const jumalautaLogosTex = 2;
const phongTex = 3;
const gourandTex = 4;
const gridTex = 5;
const svgaTex = 6;
const stereoTex = 7;
const triangleTex = 8;
const creditsTex = 9;
const part1Tex = 10;
const part2Tex = 11;
const titleTex = 12;

const overlayFx = (duration: number) =>
  concat(
    linear(1.0, 0.015)(duration * 0.125),
    hold(0.025)(duration * 0.75),
    linear(0.015, 1.0)(duration * 0.125)
  );

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
    pos: vector(sin(0.3, 0.1), sin(3, 0.02), cos(0.3, 0.1))(duration),
    lookAt: vector(sin(1, 0.2), cos(1, 0.21), sin(1, 0.12))(duration),
    up: vector(sin(1, 0.1), hold(0), cos(1, 0.1))(duration),
    fov: hold(60.0)(duration),
  });

const partTunnel = (length: number) =>
  assignSegments({
    camera: tunnelCam(length),
    overlay: overlay(noTexture, 0),
    //  concat(
    //   overlay(noTexture, length / 4),
    //   overlay(part1Tex, length / 4),
    //   overlay(noTexture, length / 4),
    //   overlay(phongTex, length / 4)
    // ),
    envGeometry: tunnel(length),
    envFactor: zero(length),
    lightCount: concat(hold(2)(length / 2), hold(3)(length / 2)),
    renderBalls: enabled(length),
    material: concat(rustingLinedMetal(length / 2), beatenUpMetal(length / 2)),
    shader: palloShader(length),
    lightIntensity: repeat(128, linear(10, 0.1)(length / 128)),
    noise: repeat(1024, linear(0.5, 0)(length / 1024)),
    scriptedTime: loop(64, (i) =>
      percPattern(hold(i * 2.7), hold((i + 0.5) * 2.7))
    ),
  });

export const script = concat(partTunnel(bars(32)));
