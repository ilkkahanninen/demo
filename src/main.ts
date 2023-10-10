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
import { getBeatenUpMetal } from "./materials/beaten-up-metal1-bl/BeatenUpMetal";
import { getRustingLinedMetal } from "./materials/rusting-lined-metal2-bl/RustingLinedMetal";
import { getUsedStainlessSteel } from "./materials/used-stainless-steel2-bl/UsedStainlessSteel";
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

const environmentMap = new CubeMapBuffer(gl, 512);
const framebuffer = new FrameBuffer(
  gl,
  config.canvas.width,
  config.canvas.height
);
const noise = new NoiseBuffer(gl, 1024);

const layers = [new URL("layers/grid.png", import.meta.url)].map(
  (url) => new Texture(gl, url)
);

const materials = [
  getBeatenUpMetal(gl),
  getRustingLinedMetal(gl),
  getUsedStainlessSteel(gl),
];

const music = new Music(new URL("tekkno2.mp3", import.meta.url));

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
        SCRIPTED_TIME: state.scriptedTime,
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
        NUMBER_OF_LIGHTS: state.lightCount,
        RENDER_BALLS: state.renderBalls,
        LIGHT_INTENSITY: state.lightIntensity,
        SCRIPTED_TIME: state.scriptedTime,
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
      });
      screen.render();
    });

    clock.requestNextFrame(renderNext);
  };

  window.onclick = () => {
    document.querySelector(".progressbar")?.remove();
    document.body.className = "running";
    clock.reset();
    requestAnimationFrame(renderNext);
    window.onclick = null;
  };
});
