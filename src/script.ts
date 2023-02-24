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

// Overlays

const noTexture = -1;
const realtimePhong = 0;
const jumalautaTex = 1;
const jumalautaLogosTex = 2;
const phongTex = 3;
const gourandTex = 4;
const gridTex = 5;
const svgaTex = 6;

const overlayFx = (duration: number) =>
  join(
    linear(1.0, 0.015)(duration * 0.25),
    hold(0.015)(duration * 0.5),
    linear(0.015, 1.0)(duration * 0.25)
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
      overlay(phongTex, length / 4),
      overlay(noTexture, length / 4),
      overlay(gourandTex, length / 4)
    ),
    envGeometry: tunnel(length),
    envFactor: zero(length),
    lightCount: join(hold(2)(length / 2), hold(3)(length / 2)),
    renderBalls: jeba(length),
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
  });

const partGlitch2 = (length: number) =>
  labels({
    camera: glitch2Cam(length),
    overlay: overlay(gridTex, length),
    envGeometry: glitch2(length),
    envFactor: zero(length),
    lightCount: hold(8)(length),
    renderBalls: jeba(length),
  });

export const script = join(
  partShadows(bars(16)),
  partTunnel(bars(16)),
  partGlitch(bars(4)),
  partGlitch2(bars(16))
);
