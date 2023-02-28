import { config } from "./config";
import {
  add,
  barCalculator,
  beatCalculator,
  cos,
  hold,
  join,
  labels,
  linear,
  offset,
  repeat,
  sampleAndHold,
  sin,
  vector,
} from "./scripting";

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
const nope = zero;
const jeba = hold(1);

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
  join(
    linear(1.0, 0.015)(duration * 0.125),
    hold(0.025)(duration * 0.75),
    linear(0.015, 1.0)(duration * 0.125)
  );

const overlay = (index: number, length: number) =>
  labels({
    texture: hold(index)(length),
    fx: overlayFx(length),
  });

// Part: Shadows

const shadowsCam = (duration: number) =>
  labels({
    pos: vector(hold(0), hold(0), hold(0))(duration),
    lookAt: vector(cos(1, 0.01), hold(0), sin(1, 0.01))(duration),
    up: vector(hold(0.0), hold(1), hold(0.0))(duration),
    fov: add(60.0)(sin(40.0, 0.03))(duration),
  });

const partShadows = (length: number) =>
  labels({
    camera: shadowsCam(length),
    overlay: join(
      overlay(noTexture, length / 2),
      overlay(jumalautaTex, length / 4),
      overlay(jumalautaLogosTex, length / 4)
    ),
    envGeometry: hommeli(length),
    envFactor: linear(0, 0.001)(length),
    lightCount: hold(4)(length),
    renderBalls: nope(length),
    material: beatenUpMetal(length),
    shader: palloShader(length),
    lightIntensity: join(linear(0, 1)(length / 2), hold(1)(length / 2)),
    noise: join(
      linear(0.16, 0.08)(length / 2),
      hold(0.08)(length * (3 / 8)),
      linear(0.08, 0.5)(length * (1 / 8))
    ),
  });

// Part: First tunnel

const tunnelCam = (duration: number) =>
  labels({
    pos: join(
      vector(hold(0), linear(-30, -7), hold(0))(duration / 2),
      vector(hold(0), linear(3, 6), hold(0))(duration / 2)
    ),
    lookAt: vector(sin(1, 0.2), cos(1, 0.21), sin(1, 0.12))(duration),
    up: vector(sin(1, 0.1), hold(0), cos(1, 0.1))(duration),
    fov: hold(60.0)(duration),
  });

const partTunnel = (length: number) =>
  labels({
    camera: tunnelCam(length),
    overlay: join(
      overlay(noTexture, length / 4),
      overlay(part1Tex, length / 4),
      overlay(noTexture, length / 4),
      overlay(phongTex, length / 4)
    ),
    envGeometry: tunnel(length),
    envFactor: zero(length),
    lightCount: join(hold(2)(length / 2), hold(3)(length / 2)),
    renderBalls: jeba(length),
    material: join(rustingLinedMetal(length / 2), beatenUpMetal(length / 2)),
    shader: palloShader(length),
    lightIntensity: offset(beat, repeat(32, linear(2, 0.1)(length / 32))),
    noise: join(
      linear(0.5, 0.08)(length / 8),
      hold(0.08)(length * (6 / 8)),
      linear(0.08, 0.5)(length / 8)
    ),
  });

// Part: glitch 1

const glitchCam = (duration: number) =>
  labels({
    pos: join(
      vector(hold(0), linear(-5, -1.5), hold(0))(duration / 2),
      vector(hold(0), linear(-1.5, 50), hold(0))(duration / 4),
      vector(hold(0), linear(50, 0), hold(0))(duration / 4)
    ),
    lookAt: vector(sin(1, 0.2), cos(1, 0.21), sin(1, 0.12))(duration),
    up: vector(sin(1, 0.2), hold(0), cos(1, 0.2))(duration),
    fov: linear(60.0, 150.0)(duration),
  });

const partGlitch = (length: number) =>
  labels({
    camera: glitchCam(length),
    overlay: overlay(noTexture, length),
    envGeometry: glitch(length),
    envFactor: zero(length),
    lightCount: join(hold(2)(length / 2), hold(3)(length / 2)),
    renderBalls: jeba(length),
    material: beatenUpMetal(length),
    shader: palloShader(length),
    lightIntensity: hold(1)(length),
    noise: join(linear(0.5, 0.08)(length / 2), linear(0.08, 0.5)(length / 2)),
  });

// Part glitch 2

const glitch2Cam = (duration: number) =>
  labels({
    pos: vector(hold(0), hold(3), hold(0))(duration),
    lookAt: vector(sin(1, 0.02), cos(1, 0.021), sin(1, 0.012))(duration),
    up: vector(sin(1, 0.02), hold(0), cos(1, 0.02))(duration),
    fov: join(
      hold(10.0)(duration / 16),
      hold(170)(duration / 16),
      hold(20.0)(duration / 16),
      hold(170)(duration / 16),
      hold(30.0)(duration / 16),
      hold(170)(duration / 16),
      hold(40.0)(duration / 16),
      hold(170)(duration / 16),
      hold(50.0)(duration / 16),
      hold(170)(duration / 16),
      hold(60.0)(duration / 16),
      hold(170)(duration / 16),
      hold(70.0)(duration / 16),
      hold(170)(duration / 16),
      hold(80.0)(duration / 16),
      hold(170)(duration / 16)
    ),
    material: beatenUpMetal(length),
    shader: palloShader(length),
  });

const partGlitch2 = (length: number) =>
  labels({
    camera: glitch2Cam(length),
    overlay: overlay(gridTex, length),
    envGeometry: glitch2(length),
    envFactor: zero(length),
    lightCount: hold(8)(length),
    renderBalls: jeba(length),
    material: beatenUpMetal(length),
    shader: palloShader(length),
    lightIntensity: hold(1)(length),
    noise: join(hold(0.08)(length * (7 / 8)), linear(0.08, 0.5)(length / 8)),
  });

// Part: Second tunnel

const tunnel2Cam = (duration: number) =>
  labels({
    pos: offset(
      beat,
      sampleAndHold(
        beat * 2,
        join(
          vector(hold(0), hold(-1.5), sin(6, 99.08))(duration / 2),
          vector(hold(0), hold(0), add(4)(sin(2, 72.08)))(duration / 2)
        )
      )
    ),
    lookAt: vector(hold(0), hold(0), hold(1))(duration),
    up: join(
      vector(sin(1, 0.1), hold(0), cos(1, 0.1))(duration / 2),
      sampleAndHold(
        beat,
        vector(sin(1, 67), cos(1, 67), sin(1, 99))(duration / 2)
      )
    ),
    fov: add(80)(sin(10.0, 0.17))(duration),
  });

const partTunnel2 = (length: number) =>
  labels({
    camera: tunnel2Cam(length),
    overlay: join(
      overlay(gourandTex, length / 2),
      overlay(svgaTex, length / 4),
      overlay(stereoTex, length / 4)
    ),
    envGeometry: hommeli(length),
    envFactor: join(
      sin(0.1, 0.1)((length * 7) / 16),
      linear(0.1, 3)(length / 16),
      add(3)(sin(0.1, 0.1))((length * 7) / 16),
      linear(3.1, 0)(length / 16)
    ),
    lightCount: join(hold(2)(length / 2), hold(3)(length / 2)),
    renderBalls: jeba(length),
    material: rustingLinedMetal(length),
    shader: palloShader(length),
    lightIntensity: repeat(128, linear(3, 0)(length / 128)),
    noise: join(hold(0.16)(length * (7 / 8)), linear(0.16, 0.32)(length / 8)),
  });

// Part: joku muoto

const jokuMuotoCam = (duration: number) =>
  labels({
    pos: vector(sin(3, 0.072), cos(3, 0.08), sin(3, 0.08))(duration),
    lookAt: vector(hold(0), hold(0), hold(0))(duration),
    up: vector(sin(1, 0.1), hold(0), cos(1, 0.1))(duration),
    fov: add(50)(sin(10.0, 0.17))(duration),
  });

const partJokuMuoto = (length: number) =>
  labels({
    camera: jokuMuotoCam(length),
    overlay: join(
      overlay(noTexture, length / 2),
      overlay(triangleTex, length / 2)
    ),
    envGeometry: hommeli(length),
    envFactor: hold(0)(length),
    lightCount: hold(2)(length),
    renderBalls: linear(0, 1)(length),
    material: stainlessSteel(length),
    shader: jokuMuotoShader(length),
    lightIntensity: offset(2 * beat, repeat(16, linear(1, 0)(length / 16))),
    noise: join(
      linear(0.5, 0.08)(length / 8),
      hold(0.08)(length * (6 / 8)),
      linear(0.08, 0.5)(length / 8)
    ),
  });

// Part: joku muoto cont.

const jokuMuoto2Cam = (duration: number) =>
  labels({
    pos: sampleAndHold(
      beat * 8,
      vector(sin(3, 10.072), sin(3, 14.08), cos(2.8, 89.08))(duration)
    ),
    lookAt: vector(
      sin(0.02, 1.072),
      cos(0.02, 1.108),
      sin(0.02, -0.408)
    )(duration),
    up: vector(sin(3, 0.072), cos(3, -0.08), sin(3, -0.08))(duration),
    fov: sampleAndHold(beat * 4, add(60)(sin(35.0, 99.17))(duration)),
  });

const partJokuMuoto2 = (length: number) =>
  labels({
    camera: jokuMuoto2Cam(length),
    overlay: labels({
      texture: join(
        hold(triangleTex)(length / 8),
        hold(noTexture)((length * 3) / 4)
      ),
      fx: linear(1.0, 2.0)(length / 8),
    }),
    envGeometry: hommeli(length),
    envFactor: join(linear(0, 1)(length / 2), linear(1, 3)(length / 2)),
    lightCount: hold(3)(length),
    renderBalls: linear(0, 1)(length),
    material: stainlessSteel(length),
    shader: jokuMuotoShader(length),
    lightIntensity: offset(length / 64, repeat(32, linear(2, 0)(length / 32))),
    noise: join(
      linear(0.5, 0.08)(length / 8),
      repeat(6, linear(0.24, 0.08)(length / 8)),
      linear(0.08, 0.5)(length / 8)
    ),
  });

// Part: outro

const outroCam = (duration: number) =>
  labels({
    pos: vector(cos(2, 0.01), sin(2, 0.01), hold(0))(duration),
    lookAt: vector(
      sin(0.02, 0.1072),
      cos(0.02, 0.1108),
      sin(0.02, -0.1408)
    )(duration),
    up: vector(sin(1, 0.0072), cos(1, -0.008), sin(1, -0.008))(duration),
    fov: linear(100, 180)(duration),
  });

const partOutro = (length: number) =>
  labels({
    camera: outroCam(length),
    overlay: join(
      overlay(noTexture, length / 8),
      overlay(part2Tex, length / 8),
      overlay(noTexture, length / 4),
      overlay(titleTex, length / 2),
      overlay(noTexture, 0)
    ),
    envGeometry: hommeli(length),
    envFactor: hold(3)(length),
    lightCount: join(
      hold(3)(length / 4),
      hold(2)(length / 4),
      hold(1)(length / 2)
    ),
    renderBalls: hold(0)(length),
    material: stainlessSteel(length),
    shader: jokuMuotoShader(length),
    lightIntensity: join(
      join(linear(10, 1)(length / 16), linear(1, 0)(length / 16)),
      repeat(3, join(linear(0, 1)(length / 16), linear(1, 0)(length / 16))),
      linear(0, 1)(length / 16),
      linear(1, 0)(length / 16),
      linear(0, 0.5)(length / 16),
      linear(0.5, 0)(length / 16),
      linear(0, 0.25)(length / 16),
      linear(0.25, 0)(length / 16),
      linear(0, 0.125)(length / 16),
      linear(0.125, 0)(length / 16),
      linear(0, 0.06)(length / 16),
      linear(0.06, 0)(length / 16),
      linear(0, 0.03)(length / 16),
      linear(0.03, 0)(length / 16)
    ),
    noise: join(
      linear(0.5, 0.08)(length / 4),
      hold(0.08)(length / 4),
      hold(0.24)(0)
    ),
  });

export const script = join(
  partShadows(bars(16)),
  partTunnel(bars(16)),
  partGlitch(bars(4)),
  partGlitch2(bars(16)),
  partTunnel2(bars(16)),
  partJokuMuoto(bars(16)),
  partJokuMuoto2(bars(16)),
  partOutro(bars(32))
);
