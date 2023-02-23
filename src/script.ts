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

// Camera

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

const shadowsCam = (duration: number) =>
  labels({
    pos: vector(hold(0), hold(0), hold(0))(duration),
    lookAt: vector(cos(1, 0.01), hold(0), sin(1, 0.01))(duration),
    up: vector(hold(0.0), hold(1), hold(0.0))(duration),
    fov: add(60.0)(sin(40.0, 0.03))(duration),
  });

// Overlays

const noTexture = hold(-1);
const introTex = hold(0);
const mattCurrentTex = hold(1);
const overlayFx = (duration: number) =>
  join(
    linear(1.0, 0.015)(duration * 0.25),
    hold(0.015)(duration * 0.5),
    linear(0.015, 1.0)(duration * 0.25)
  );

const noOverlay = (length: number) =>
  labels({
    texture: noTexture(length),
    fx: hold(0)(length),
  });

const introOverlay = (length: number) =>
  labels({
    texture: join(introTex(length), noTexture(0)),
    fx: overlayFx(length),
  });

const mattCurrentOverlay = (length: number) =>
  labels({
    texture: join(mattCurrentTex(length), noTexture(0)),
    fx: overlayFx(length),
  });

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

const partShadows = (length: number) =>
  labels({
    camera: shadowsCam(length),
    overlay: join(
      noOverlay(length / 2),
      mattCurrentOverlay(length / 4),
      mattCurrentOverlay(length / 4)
    ),
    envGeometry: hommeli(length),
    envFactor: linear(0, 0.001)(length),
    lightCount: hold(4)(length),
    renderBalls: nope(length),
  });

const partTunnel = (length: number) =>
  labels({
    camera: tunnelCam(length),
    overlay: noOverlay(length),
    envGeometry: tunnel(length),
    envFactor: zero(length),
    lightCount: join(hold(2)(length / 2), hold(3)(length / 2)),
    renderBalls: jeba(length),
  });

const partGlitch = (length: number) =>
  labels({
    camera: tunnelCam(length),
    overlay: noOverlay(length),
    envGeometry: glitch(length),
    envFactor: zero(length),
    lightCount: join(hold(2)(length / 2), hold(3)(length / 2)),
    renderBalls: jeba(length),
  });

const partGlitch2 = (length: number) =>
  labels({
    camera: tunnelCam(length),
    overlay: noOverlay(length),
    envGeometry: glitch2(length),
    envFactor: zero(length),
    lightCount: join(hold(2)(length / 2), hold(3)(length / 2)),
    renderBalls: jeba(length),
  });

export const script = join(
  partShadows(bars(16)),
  partTunnel(bars(16)),
  partGlitch(bars(4)),
  partGlitch2(bars(16))
);
