import { config } from "./config";
import {
  barCalculator,
  beatCalculator,
  expr,
  hold,
  join,
  labels,
  linear,
  vector,
} from "./scripting";

const beats = beatCalculator(config.bpm);
const bars = barCalculator(config.bpm, 4);

const beat = beats(1);
const bar = bars(1);

// Camera

const vemputus = (duration: number) =>
  labels({
    pos: vector([
      expr((t) => 1.6 * 2.3 * Math.cos(t * 0.8))(duration),
      expr((t) => 3.6 * Math.cos(t * 6.0))(duration),
      expr((t) => 1.6 * 1.3 * Math.sin(t * 8.0))(duration),
    ]),
    lookAt: vector([
      expr((t) => 1.5 * Math.cos(t * 2.0))(duration),
      hold(0)(duration),
      hold(0)(duration),
    ]),
    up: vector([
      expr((t) => Math.sin(t * 0.1))(duration),
      expr((t) => Math.cos(t * 0.12))(duration),
      expr((t) => Math.sin(t * 0.17))(duration),
    ]),
  });

const camera = vemputus(1000.0);

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

const introOverlay = labels({
  texture: join(introTex(4 * bar), noTexture(0)),
  fx: overlayFx(4 * bar),
});

const mattCurrentOverlay = labels({
  texture: join(mattCurrentTex(2 * bar), noTexture(0)),
  fx: overlayFx(2 * bar),
});

const overlay = join(introOverlay, mattCurrentOverlay);

// Main script

export const script = labels({
  camera,
  overlay,
});
