import { config } from "./config";
import {
  add,
  barCalculator,
  beatCalculator,
  cos,
  expr,
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
const partLength = bars(16);

// Camera

const stillIntroCam = (duration: number) =>
  labels({
    pos: vector(hold(0), hold(0), hold(10))(duration),
    lookAt: vector(hold(0), hold(0), hold(0))(duration),
    up: vector(sin(1, 0.1), hold(0), cos(1, 0.1))(duration),
    fov: hold(60.0)(duration),
  });

const vemputusCam = (duration: number) =>
  labels({
    pos: vector(cos(3.68, 0.2), cos(3.6, 1.2), sin(2.08, 1.3))(duration),
    lookAt: vector(cos(1.5, 0.6), hold(0), hold(0))(duration),
    up: vector(
      expr((t) => Math.sin(t * 0.1)),
      expr((t) => Math.cos(t * 0.12)),
      expr((t) => Math.sin(t * 0.17))
    )(duration),
    fov: add(60.0)(sin(40.0, 0.1))(duration),
  });

const camera = join(stillIntroCam(partLength), vemputusCam(1000.0));

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

const noOverlay = labels({
  texture: noTexture(partLength),
  fx: hold(0)(partLength),
});

const introOverlay = labels({
  texture: join(introTex(partLength), noTexture(0)),
  fx: overlayFx(partLength),
});

const mattCurrentOverlay = labels({
  texture: join(mattCurrentTex(partLength), noTexture(0)),
  fx: overlayFx(partLength),
});

const overlay = join(noOverlay, introOverlay, mattCurrentOverlay);

// Main script

export const script = labels({
  camera,
  overlay,
});
