import { Clock } from "./Clock";
import { Rectangle } from "./Rectangle";
import { loadResources } from "./Resource";
import { ShaderProgram } from "./ShaderProgram";
import { vec2, vec3 } from "./vectors";

import { CubeMapBuffer } from "./CubeMapBuffer";
import { FrameBuffer } from "./FrameBuffer";
import { renderCanvas } from "./FrameContext";
import { NoiseBuffer } from "./NoiseBuffer";
import { Texture } from "./Texture";
import { Music } from "./audio";
import { config } from "./config";
import { fromGltfBinaryUrl } from "./gltf/index";
import { getStreakedMetal } from "./materials/streakedmetal/StreakedMetal";
import bloomCopySrc from "./scene/bloomCopy.frag";
import blurXSrc from "./scene/blurX.frag";
import blurYSrc from "./scene/blurY.frag";
import defaultVertexSrc from "./scene/default.vert";
import postprocessSrc from "./scene/postprocess.frag";
import scene1Src from "./scene/scene1.frag";
import { script } from "./script";

const canvas = document.querySelector<HTMLCanvasElement>("canvas")!;
canvas.style.width = "100%";
canvas.width = config.canvas.width;
canvas.height = config.canvas.height;

const gl = canvas.getContext("webgl2")!;
gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
const colorBufferFloatExt = gl.getExtension("EXT_color_buffer_float");
if (!colorBufferFloatExt) {
  throw new Error("EXT_color_buffer_float is not supported");
}

if (process.env.NODE_ENV !== "production") {
  if (!gl) {
    alert(
      "Unable to initialize WebGL. Your browser or machine may not support it."
    );
  }
}

fromGltfBinaryUrl(gl, new URL("../test/Lantern.glb", import.meta.url))
  .then((asset) => {
    asset.loadScene();
  })
  .catch(console.error);

const environmentMap = new CubeMapBuffer(gl, 512);
const framebuffer = new FrameBuffer(
  gl,
  config.canvas.width,
  config.canvas.height
);
const noise = new NoiseBuffer(gl, 1024);

const layers = [
  new URL("layers/intro-01.png", import.meta.url),
  new URL("layers/intro-02.png", import.meta.url),
  new URL("layers/intro-03.png", import.meta.url),
  new URL("layers/intro-05.png", import.meta.url),
  new URL("layers/intro-06.png", import.meta.url),

  new URL("layers/laundry-01.png", import.meta.url),
  new URL("layers/laundry-02.png", import.meta.url),
  new URL("layers/laundry-03.png", import.meta.url),
  new URL("layers/laundry-04.png", import.meta.url),
  new URL("layers/laundry-05.png", import.meta.url),

  new URL("layers/symbols-1a.png", import.meta.url),
  new URL("layers/symbols-1b.png", import.meta.url),
  new URL("layers/symbols-1c.png", import.meta.url),
  new URL("layers/symbols-1d.png", import.meta.url),
  new URL("layers/symbols-2a.png", import.meta.url),
  new URL("layers/symbols-2b.png", import.meta.url),
  new URL("layers/symbols-2c.png", import.meta.url),
  new URL("layers/symbols-2d.png", import.meta.url),
  new URL("layers/symbols-3a.png", import.meta.url),
  new URL("layers/symbols-3b.png", import.meta.url),
  new URL("layers/symbols-3c.png", import.meta.url),
  new URL("layers/symbols-3d.png", import.meta.url),
  new URL("layers/symbols-4a.png", import.meta.url),
  new URL("layers/symbols-4b.png", import.meta.url),
  new URL("layers/symbols-4c.png", import.meta.url),
  new URL("layers/symbols-4d.png", import.meta.url),

  new URL("layers/repeat.png", import.meta.url),
  new URL("layers/credits-01.png", import.meta.url),
  new URL("layers/credits-02.png", import.meta.url),
  new URL("layers/credits-03.png", import.meta.url),

  new URL("layers/seizure.png", import.meta.url),
  new URL("layers/seizure2.png", import.meta.url),
  new URL("layers/seizure3.png", import.meta.url),

  new URL("layers/overlay1.png", import.meta.url),
  new URL("layers/overlay2.png", import.meta.url),
  new URL("layers/overlay3.png", import.meta.url),
  new URL("layers/overlay4.png", import.meta.url),
].map((url) => new Texture(gl, url));

const materials = [getStreakedMetal(gl)];

const music = new Music(new URL("tekkno2.ogg", import.meta.url));

loadResources(music, ...materials, ...layers).then(() => {
  const screen = new Rectangle(gl);

  const balls = new ShaderProgram(gl, defaultVertexSrc, scene1Src);

  const [ballsVertexPos, ballsTexCoords] = balls.vertexAttributes(
    "VERTEX_POS",
    "TEX_COORDS"
  );

  balls.setupSamplers(
    "ALBEDO_SAMPLER",
    "METALLIC_SAMPLER",
    "ROUGHNESS_SAMPLER",
    "AO_SAMPLER",
    "ENVIRONMENT_SAMPLER"
  );

  const ballsEnv = new ShaderProgram(gl, defaultVertexSrc, scene1Src, {
    RENDER_ENVIRONMENT_MAP: true,
  });

  ballsEnv.setupSamplers(
    "ALBEDO_SAMPLER",
    "METALLIC_SAMPLER",
    "ROUGHNESS_SAMPLER",
    "AO_SAMPLER"
  );

  const bloomCopy = new ShaderProgram(gl, defaultVertexSrc, bloomCopySrc);
  const blur1stPass = new ShaderProgram(gl, defaultVertexSrc, blurXSrc);
  const blur2ndPass = new ShaderProgram(gl, defaultVertexSrc, blurYSrc);

  const bloomBufferA = new FrameBuffer(gl, gl.canvas.width, gl.canvas.height);
  const bloomBufferB = new FrameBuffer(gl, gl.canvas.width, gl.canvas.height);

  const postprocess = new ShaderProgram(gl, defaultVertexSrc, postprocessSrc);
  postprocess.setupSamplers("FRAME", "NOISE", "BLOOM", "LAYER");

  const clock = new Clock(config.bpm, music);

  const objectShaders = [balls];
  const envShaders = [ballsEnv];

  const renderNext = () => {
    const time = clock.seconds();
    const state = script.get(time);
    const material = materials[state.material];
    const objectShader = objectShaders[state.shader];
    const envShader = envShaders[state.shader];
    screen.bind(ballsVertexPos, ballsTexCoords);

    // Rendataan ympäristö kuutioon
    environmentMap.renderToItself(envShader, (direction, up) => {
      material.bindAt(gl.TEXTURE0);
      envShader.set({
        TIME: time,
        CAMERA_POS: vec3(0.0, 0.0, 0.0),
        CAMERA_LOOKAT: direction,
        CAMERA_UP: up,
        CAMERA_FOV: 90,
        ENV_GEOMETRY: state.envGeometry,
        ENV_FACTOR: state.envFactor,
        NUMBER_OF_LIGHTS: state.lightCount,
        LIGHT_INTENSITY: state.lightIntensity,
        TIME_MOD: state.timeModifier,
      });
      screen.render();
    });

    // Päärendaushomma
    framebuffer.renderToItself(objectShader, () => {
      material.bindAt(gl.TEXTURE0);
      environmentMap.bindAt(gl.TEXTURE4);

      objectShader.set({
        TIME: time,
        CAMERA_POS: state.camera.pos,
        CAMERA_LOOKAT: state.camera.lookAt,
        CAMERA_UP: state.camera.up,
        CAMERA_FOV: state.camera.fov,
        ENV_GEOMETRY: state.envGeometry,
        ENV_FACTOR: state.envFactor,
        OBJECT: state.object,
        NUMBER_OF_LIGHTS: state.lightCount,
        LIGHT_INTENSITY: state.lightIntensity,
        TIME_MOD: state.timeModifier,
      });

      screen.render();
    });

    // Kopio framesta bloom-bufferiin
    bloomBufferA.renderToItself(bloomCopy, () => {
      framebuffer.useAt(gl.TEXTURE0);
      screen.render();
    });

    bloomBufferB.renderToItself(blur1stPass, () => {
      bloomBufferA.useAt(gl.TEXTURE0);
      screen.render();
    });

    bloomBufferA.renderToItself(blur2ndPass, () => {
      bloomBufferB.useAt(gl.TEXTURE0);
      screen.render();
    });

    // Framebuffer ruudulle

    renderCanvas(postprocess)(() => {
      framebuffer.useAt(gl.TEXTURE0);
      noise.useAt(gl.TEXTURE1);
      bloomBufferA.useAt(gl.TEXTURE2);

      layers[state.overlay.texture]?.useAt(gl.TEXTURE3);

      postprocess.set({
        NOISE_POS: vec2(Math.random(), Math.random()),
        TIME: time,
        LAYER_FX: state.overlay.fx,
        LAYER_ALPHA: state.overlay.texture >= 0 ? 1 : 0,
        NOISE_STRENGTH: state.noise,
        POST_EFFECT: state.postEffect,
        DISTANCE_COLOR_FX: state.distanceColorFx,
        SATURATION: state.saturation,
        BLUE_PASS: state.bluePass,
        CONTRAST: state.contrast,
      });
      screen.render();
    });

    clock.requestNextFrame(renderNext);
  };

  let started = false;

  window.addEventListener("keydown", (event) => {
    if (event.code == "KeyF") {
      document.body.requestFullscreen();
    }
  });

  window.onclick = () => {
    document.body.className = "running";
    clock.reset();
    requestAnimationFrame(renderNext);
    window.onclick = null;
  };
});
