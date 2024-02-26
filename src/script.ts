import { config } from "./config";
import {
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
  multiplySegments,
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

const materials = {
  streakedMetal: hold(0),
};

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

  seizureWarning: 30,
  seizureWarning2: 31,
  seizureWarning3: 32,

  overlay1: 33,
  overlay2: 34,
  overlay3: 35,
  overlay4: 36,
};

const overlayFx = (duration: number) =>
  concat(linear(1.0, 0.015)(duration / 2), linear(0.015, 1.0)(duration / 2));

const overlay = (index: number, length: number) =>
  assignSegments({
    texture: hold(index)(length),
    fx: overlayFx(length),
  });

// Part: 1

const tunnelCam = (duration: number) =>
  assignSegments({
    pos: vector(sin(0.3, 0.1), sin(10, 0.002), cos(0.3, 0.1))(duration),
    lookAt: vector(sin(1, 0.2), cos(1, 0.21), sin(1, 0.12))(duration),
    up: vector(sin(1, 0.1), hold(0), cos(1, 0.1))(duration),
    fov: sampleAndHold(beat, add(120)(sin(50, 999))(duration)),
  });

const introScene = (duration: number) =>
  assignSegments({
    camera: assignSegments({
      pos: vector(hold(1), hold(0), hold(0))(duration),
      lookAt: vector(hold(0), hold(0), hold(0))(duration),
      up: vector(hold(0), hold(0), hold(1))(duration),
      fov: concat(
        linear(180, 70)(duration / 3),
        sampleAndHold(beat, add(120)(sin(50, 999))((duration * 2) / 3))
      ),
    }),
    envGeometry: pesurumpu(duration),
    envFactor: linear(100, 20)(duration),
    lightCount: concat(hold(2)(duration / 2), hold(3)(duration / 2)),
    object: hold(0)(duration),
    material: materials.streakedMetal(duration),
    shader: palloShader(duration),
    lightIntensity: repeat(128, linear(10, -10)(duration / 128)),
    noise: repeat(1024, linear(0.5, 0)(duration / 1024)),
    timeModifier: loop(64, (i) =>
      concat(
        hold(i * 2.7)(duration / 128),
        hold((i + 0.5) * 2.7)(duration / 128)
      )
    ),
    postEffect: hold(0)(duration),
    saturation: repeat(
      3,
      concat(
        hold(0.0)(bars(7) + beats(3)),
        repeat(4, concat(hold(1)(beat / 8), hold(0)(beat / 8)))
      )
    ),
  });

const introSpeechScene = (duration: number) =>
  assignSegments({
    camera: assignSegments({
      pos: vector(hold(1), hold(0), hold(0))(duration),
      lookAt: vector(hold(0), hold(0), hold(0))(duration),
      up: vector(hold(0), hold(0), hold(1))(duration),
      fov: concat(
        sampleAndHold(beat, add(120)(sin(50, 999))(duration - beat)),
        linear(180, 1)(beat)
      ),
    }),
    envGeometry: pesurumpu(duration),
    envFactor: linear(100, 20)(duration),
    lightCount: concat(hold(2)(duration / 2), hold(3)(duration / 2)),
    object: hold(0)(duration),
    material: materials.streakedMetal(duration),
    shader: palloShader(duration),
    lightIntensity: repeat(98, linear(10, 0.1)(duration / 98)),
    noise: repeat(1024, linear(0.5, 0)(duration / 1024)),
    timeModifier: loop(96, (i) =>
      concat(
        hold(i * 2.7)(duration / 192),
        hold((i + 0.5) * 2.7)(duration / 192)
      )
    ),
    postEffect: hold(0)(duration),
    saturation: concat(linear(0, 0.4)(duration - beat), linear(0.4, 1)(beat)),
  });

const laundryScene = (duration: number) =>
  assignSegments({
    camera: assignSegments({
      pos: vector(sin(3, 0.1), sin(10, 0.002), cos(3, 0.1))(duration),
      lookAt: vector(hold(0), hold(0), hold(0))(duration),
      up: vector(sin(1, 0.3), hold(0), cos(1, 0.3))(duration),
      fov: repeat(8, concat(linear(180, 10)(duration / 8))),
    }),
    envGeometry: pesurumpu(duration),
    envFactor: hold(5)(duration),
    lightCount: hold(3)(duration),
    object: hold(1)(duration),
    material: materials.streakedMetal(duration),
    shader: palloShader(duration),
    lightIntensity: repeat(256, linear(10, 0)(duration / 256)),
    noise: repeat(1024, linear(1.0, 0)(duration / 1024)),
    timeModifier: loop(32, (i) =>
      concat(hold(i * 2.7)(duration / 64), hold((i + 0.5) * 2.7)(duration / 64))
    ),
    postEffect: repeat(128, linear(0.1, 0)(duration / 128)),
    saturation: hold(1)(duration),
  });

const washingScene = (duration: number) =>
  assignSegments({
    camera: assignSegments({
      pos: vector(sin(0.3, 0.01), sin(10, 0.002), cos(0.3, 0.01))(duration),
      lookAt: vector(sin(1, 0.02), cos(1, 0.021), sin(1, 0.012))(duration),
      up: vector(sin(1, 0.01), hold(0), cos(1, 0.01))(duration),
      fov: linear(180, 10)(duration),
    }),
    envGeometry: pesurumpu(duration),
    envFactor: linear(100, 1)(duration),
    lightCount: hold(3)(duration / 2),
    object: hold(0)(duration),
    material: materials.streakedMetal(duration),
    shader: palloShader(duration),
    lightIntensity: repeat(128, linear(10, 0.1)(duration / 128)),
    noise: repeat(1024, linear(0.5, 0)(duration / 1024)),
    timeModifier: loop(64, (i) =>
      concat(
        hold(i * 2.7)(duration / 128),
        hold((i + 0.5) * 2.7)(duration / 128)
      )
    ),
    postEffect: repeat(32, linear(0, 2)(duration / 32)),
    saturation: hold(1)(duration),
  });

const bleachScene = (duration: number) =>
  assignSegments({
    camera: assignSegments({
      pos: vector(sin(0.3, 0.01), sin(10, 0.002), cos(0.3, 0.01))(duration),
      lookAt: vector(sin(1, 0.02), cos(1, 0.021), sin(1, 0.012))(duration),
      up: vector(sin(1, 0.01), hold(0), cos(1, 0.01))(duration),
      fov: sampleAndHold(beats(2), add(120)(sin(50, 999))(duration)),
    }),
    envGeometry: tunnel(duration),
    envFactor: hold(3)(duration),
    lightCount: hold(3)(duration),
    object: hold(2)(duration),
    material: materials.streakedMetal(duration),
    shader: palloShader(duration),
    lightIntensity: repeat(64, linear(10, -10)(duration / 64)),
    noise: repeat(1024, linear(0.5, 0)(duration / 1024)),
    timeModifier: loop(64, (i) =>
      concat(
        hold(i * 2.7)(duration / 128),
        hold((i + 0.5) * 2.7)(duration / 128)
      )
    ),
    postEffect: repeat(32, linear(0, 2)(duration / 32)),
    saturation: concat(
      linear(1, 0.1)(bar),
      hold(0.1)(duration - bars(2)),
      linear(0.1, 1)(bar)
    ),
  });

const tumbleDryScene = (duration: number) =>
  assignSegments({
    camera: assignSegments({
      pos: vector(sin(0.3, 0.01), sin(10, 0.002), cos(0.3, 0.01))(duration),
      lookAt: vector(sin(1, 0.02), cos(1, 0.021), sin(1, 0.012))(duration),
      up: vector(sin(1, 0.01), hold(0), cos(1, 0.01))(duration),
      fov: sampleAndHold(beats(2), add(120)(sin(50, 999))(duration)),
    }),
    envGeometry: tunnel(duration),
    envFactor: hold(3)(duration),
    lightCount: hold(3)(duration),
    object: hold(3)(duration),
    material: materials.streakedMetal(duration),
    shader: palloShader(duration),
    lightIntensity: repeat(
      16,
      concat(
        linear(10, 0)(duration / 64),
        linear(5, 0)(duration / 64),
        linear(10, 0)(duration / 64),
        linear(5, -5)(duration / 64)
      )
    ),
    noise: repeat(1024, linear(0.5, 0)(duration / 1024)),
    timeModifier: loop(64, (i) =>
      concat(
        hold(i * 2.7)(duration / 128),
        hold((i + 0.5) * 2.7)(duration / 128)
      )
    ),
    postEffect: repeat(32, linear(0, 2)(duration / 32)),
    saturation: hold(1)(duration - bars(2)),
  });

const drycleanScene = (duration: number) =>
  assignSegments({
    camera: assignSegments({
      pos: vector(sin(0.3, 0.01), hold(2), cos(0.3, 0.01))(duration),
      lookAt: vector(sin(1, 0.02), cos(1, 0.021), sin(1, 0.012))(duration),
      up: vector(sin(1, 0.01), hold(0), cos(1, 0.01))(duration),
      fov: sampleAndHold(beats(2), add(120)(sin(50, 999))(duration)),
    }),
    envGeometry: tunnel(duration),
    envFactor: hold(3)(duration),
    lightCount: hold(3)(duration),
    object: hold(1)(duration),
    material: materials.streakedMetal(duration),
    shader: palloShader(duration),
    lightIntensity: repeat(64, linear(200, 0)(duration / 64)),
    noise: repeat(1024, linear(0.5, 0)(duration / 1024)),
    timeModifier: loop(64, (i) =>
      concat(
        hold(i * 2.7)(duration / 128),
        hold((i + 0.5) * 2.7)(duration / 128)
      )
    ),
    postEffect: multiplySegments(
      repeat(128, linear(1, 0)(duration / 128)),
      linear(0.2, 1)(duration)
    ),
    saturation: hold(1)(duration - bars(2)),
  });

const rinseAndRepeatScene = (duration: number) =>
  assignSegments({
    camera: assignSegments({
      pos: vector(hold(1), hold(0), hold(0))(duration),
      lookAt: vector(hold(0), hold(0), hold(0))(duration),
      up: vector(cos(1, 0.02), cos(1, 0.003), sin(1, 0.02))(duration),
      fov: concat(linear(180, 1)(duration)),
    }),
    envGeometry: pesurumpu(duration),
    envFactor: linear(100, 20)(duration),
    lightCount: hold(3)(duration),
    object: hold(2)(duration),
    material: materials.streakedMetal(duration),
    shader: palloShader(duration),
    lightIntensity: repeat(128 - 16, linear(10, 0.1)(duration / 128)),
    noise: repeat(1024, linear(0.5, 0)(duration / 1024)),
    timeModifier: loop(4, (i) =>
      concat(hold(i * 2.7)(duration / 8), hold((i + 0.5) * 2.7)(duration / 8))
    ),
    postEffect: linear(0.2, 0)(duration),
    saturation: linear(0.5, 1)(duration),
  });

const loppuScene = (duration: number) =>
  assignSegments({
    camera: assignSegments({
      pos: vector(sin(0.3, 0.1), sin(20, 0.002), cos(0.3, 0.1))(duration),
      lookAt: vector(sin(1, 0.2), cos(1, 0.21), sin(1, 0.12))(duration),
      up: vector(sin(1, 0.1), hold(0), cos(1, 0.1))(duration),
      fov: sampleAndHold(beat, add(80)(sin(70, 999))(duration)),
    }),
    envGeometry: repeat(
      32,
      concat(tunnel(duration / 64), pesurumpu(duration / 64))
    ),
    envFactor: add(3)(sin(2, 1))(duration),
    lightCount: hold(3)(duration / 2),
    object: repeat(
      16,
      concat(
        hold(0)(duration / 64),
        hold(1)(duration / 64),
        hold(2)(duration / 64),
        hold(3)(duration / 64)
      )
    ),
    material: materials.streakedMetal(duration),
    shader: palloShader(duration),
    lightIntensity: concat(
      repeat(64, linear(10, 0.1)(duration / 128)),
      repeat(128, linear(10, 0.1)(duration / 256))
    ),
    noise: repeat(1024, linear(0.5, 0)(duration / 1024)),
    timeModifier: concat(
      loop(32, (i) =>
        concat(
          hold(i * 2.7)(duration / 128),
          hold((i + 0.5) * 2.7)(duration / 128)
        )
      ),
      loop(64, (i) =>
        concat(
          hold(i * 2.7)(duration / 256),
          hold((i + 0.5) * 2.7)(duration / 256)
        )
      )
    ),
    postEffect: repeat(32, linear(1, 0)(duration / 32)),
    saturation: repeat(64, linear(1, 0)(duration / 64)),
  });

const xScene = (duration: number) =>
  assignSegments({
    camera: assignSegments({
      pos: vector(hold(1), hold(1), hold(1))(duration),
      lookAt: vector(sin(1, 0.2), cos(1, 0.21), sin(1, 0.12))(duration),
      up: vector(sin(1, 0.1), hold(0), cos(1, 0.1))(duration),
      fov: sampleAndHold(beat, add(175)(sin(30, 999))(duration)),
    }),
    envGeometry: pesurumpu(duration),
    envFactor: linear(100, 20)(duration),
    lightCount: concat(hold(2)(duration / 2), hold(3)(duration / 2)),
    object: concat(
      hold(2)(duration / 4),
      hold(3)(duration / 4),
      hold(2)(duration / 8),
      hold(3)(duration / 8),
      hold(2)(duration / 8),
      hold(3)(duration / 8)
    ),
    material: materials.streakedMetal(duration),
    shader: palloShader(duration),
    lightIntensity: repeat(128, linear(10, 0.1)(duration / 128)),
    noise: repeat(1024, linear(0.5, 0)(duration / 1024)),
    timeModifier: loop(64, (i) =>
      concat(
        hold(i * 2.7)(duration / 128),
        hold((i + 0.5) * 2.7)(duration / 128)
      )
    ),
    postEffect: repeat(
      8,
      multiplySegments(
        repeat(4, linear(1, 0)(duration / 32)),
        linear(1, 0)(duration / 8)
      )
    ),
    saturation: hold(1)(duration),
  });

const slut = (duration: number) =>
  assignSegments({
    camera: assignSegments({
      pos: vector(hold(0.0), hold(0.1), hold(0))(duration),
      lookAt: vector(hold(0.0), hold(0.0), hold(0.0))(duration),
      up: vector(hold(0), hold(0), hold(1))(duration),
      fov: hold(60)(duration),
    }),
    envGeometry: hold(0)(duration),
    envFactor: zero(duration),
    lightCount: hold(0)(duration),
    object: hold(0)(duration),
    material: materials.streakedMetal(duration),
    shader: palloShader(duration),
    lightIntensity: hold(50)(duration),
    noise: hold(0)(duration),
    timeModifier: hold(0)(duration),
    postEffect: hold(0)(duration),
    saturation: linear(1, 0)(bars(4)),
  });

const overlayScript = concat(
  overlay(overlays.none, bars(4)),
  assignSegments({
    texture: concat(
      hold(overlays.seizureWarning)(bars(3) + beats(2)),
      hold(overlays.seizureWarning2)(beat),
      hold(overlays.seizureWarning3)(beat)
    ),
    fx: concat(overlayFx(bars(3) + beats(3)), linear(1, 0)(beat)),
  }),
  overlay(overlays.none, bars(16)),

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
    4,
    concat(
      overlay(overlays.we, beats(1)),
      overlay(overlays.need, beats(0.25)),
      overlay(overlays.toDo, beats(1)),
      overlay(overlays.some, beats(0.75)),
      overlay(overlays.laundry, beats(1)),
      overlay(overlays.none, beats(4))
    )
  ),
  loop(4, (index) =>
    concat(
      overlay(overlays.we, beats(1)),
      overlay(overlays.need, beats(0.25)),
      overlay(overlays.toDo, beats(1)),
      overlay(overlays.some, beats(0.75)),
      overlay(overlays.laundry, beats(1)),
      overlay(overlays.none, beats(1)),
      overlay(
        [
          overlays.overlay1,
          overlays.overlay2,
          overlays.overlay3,
          overlays.overlay4,
        ][index % 4],
        beats(2)
      ),
      overlay(overlays.none, beat)
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
  overlay(overlays.none, bars(8)),

  // Loppupauke
  concat(
    overlay(overlays.symbol1a, beat),
    overlay(overlays.none, beat),
    overlay(overlays.symbol2a, beat),
    overlay(overlays.none, beat),
    overlay(overlays.symbol3a, beat),
    overlay(overlays.none, beat),
    overlay(overlays.symbol4a, beat),
    overlay(overlays.none, beat),
    overlay(overlays.symbol1b, beat),
    overlay(overlays.none, beat),
    overlay(overlays.symbol2b, beat),
    overlay(overlays.none, beat),
    overlay(overlays.symbol3b, beat),
    overlay(overlays.none, beat),
    overlay(overlays.symbol4b, beat),
    overlay(overlays.none, beat),
    overlay(overlays.symbol1c, beat),
    overlay(overlays.none, beat),
    overlay(overlays.symbol2c, beat),
    overlay(overlays.none, beat),
    overlay(overlays.symbol3c, beat),
    overlay(overlays.none, beat),
    overlay(overlays.symbol4c, beat),
    overlay(overlays.none, beat),
    overlay(overlays.symbol1d, beat),
    overlay(overlays.none, beat),
    overlay(overlays.symbol2d, beat),
    overlay(overlays.none, beat),
    overlay(overlays.symbol3d, beat),
    overlay(overlays.none, beat),
    overlay(overlays.symbol4d, beat),
    overlay(overlays.none, beat)
  ),
  // Lopputekstit
  overlay(overlays.credits01, bars(4)),
  overlay(overlays.credits02, bars(4)),
  overlay(overlays.none, bars(1)),
  overlay(overlays.thankYou, bars(3))
);

const distanceColorFx = multiplySegments(
  fft(testFft),
  concat(linear(0, 1)(bars(32)))
);

const contrast = concat(
  hold(1)(bars(24 + 2 * 16 + 4 * 8 + 8 - 2)),
  linear(1, 2)(bars(2)),
  hold(2)(bars(8)),
  linear(2, 1)(bars(2))
);

const bluePass = concat(
  hold(1)(bars(4)),
  hold(0)(bars(2)),
  hold(1)(bars(2)),
  hold(1)(bars(8)),
  repeat(
    14,
    concat(hold(1)(beat * 1.5), linear(0, 1)(beat * 1.5), hold(1)(beat))
  ),
  hold(1)(bars(2)),
  linear(0, 1)(beat)
);

export const script = mergeSegments(
  mergeSegments(
    concat(
      introScene(bars(24)),
      introSpeechScene(bars(16)),
      laundryScene(bars(16)),

      washingScene(bars(8)),
      bleachScene(bars(8)),
      tumbleDryScene(bars(8)),
      drycleanScene(bars(8)),

      rinseAndRepeatScene(bars(8)),
      xScene(bars(8)),
      xScene(bars(16)),
      slut(bars(64))
    ),
    assignSegments({
      overlay: overlayScript,
    })
  ),
  assignSegments({
    distanceColorFx,
    bluePass,
    contrast,
  })
);
