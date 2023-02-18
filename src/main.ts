import { Clock } from "./Clock";
import { getMetal } from "./materials/metal/Metal";
import { Rectangle } from "./Rectangle";
import { waitFor } from "./Resource";
import { ShaderProgram } from "./ShaderProgram";
import { vec2, vec3 } from "./vectors";

import { config } from "./config";
import { CubeMapBuffer } from "./CubeMapBuffer";
import { FrameBuffer } from "./FrameBuffer";
import { renderCanvas } from "./FrameContext";
import { NoiseBuffer } from "./NoiseBuffer";
import bloomCopySrc from "./scene/bloomCopy.frag";
import blurXSrc from "./scene/blurX.frag";
import blurYSrc from "./scene/blurY.frag";
import defaultVertexSrc from "./scene/default.vert";
import pallotTunnelissaSrc from "./scene/pallotTunnelissa.frag";
import postprocessSrc from "./scene/postprocess.frag";
import { script } from "./script";
import { Texture } from "./Texture";

document.body.style.background = "#000";
document.body.style.margin = "0";
document.body.style.display = "flex";
document.body.style.alignItems = "center";
document.body.style.height = "100vh";

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

const material = getMetal(gl);

const environmentMap = new CubeMapBuffer(gl, 512);
const framebuffer = new FrameBuffer(
  gl,
  config.canvas.width,
  config.canvas.height
);
const noise = new NoiseBuffer(gl, 1024);

const layers = [
  new URL("layers/Intro.png", import.meta.url),
  new URL("layers/Matt Current.png", import.meta.url),
].map((url) => new Texture(gl, url));

waitFor(material, ...layers).then(() => {
  const screen = new Rectangle(gl);

  const balls = new ShaderProgram(gl, defaultVertexSrc, pallotTunnelissaSrc);

  const [vertexPos, overlayTexturePos] = balls.vertexAttributes(
    "VERTEX_POS",
    "OVERLAY_TEXTURE_POS"
  );

  balls.setupSamplers(
    "ALBEDO_SAMPLER",
    "METALLIC_SAMPLER",
    "ROUGHNESS_SAMPLER",
    "AO_SAMPLER",
    "ENVIRONMENT_SAMPLER"
  );

  const ballsEnv = new ShaderProgram(
    gl,
    defaultVertexSrc,
    pallotTunnelissaSrc,
    {
      RENDER_ENVIRONMENT_MAP: true,
    }
  );

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

  const clock = new Clock(config.bpm);

  const renderNext = () => {
    const time = clock.seconds();
    const state = script.get(time);

    screen.bind(vertexPos, overlayTexturePos);

    // Rendataan ympäristö kuutioon
    environmentMap.renderToItself(ballsEnv, (direction, up) => {
      ballsEnv.set({
        TIME: time,
        CAMERA_POS: vec3(0.0, 0.0, 0.0),
        CAMERA_LOOKAT: direction,
        CAMERA_UP: up,
      });
      material.bindAt(gl.TEXTURE0);
      screen.render();
    });

    // Päärendaushomma
    framebuffer.renderToItself(balls, () => {
      material.bindAt(gl.TEXTURE0);
      environmentMap.bindAt(gl.TEXTURE4);

      balls.set({
        TIME: time,
        CAMERA_POS: state.camera.pos,
        CAMERA_LOOKAT: state.camera.lookAt,
        CAMERA_UP: state.camera.up,
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
      });
      screen.render();
    });

    clock.requestNextFrame(renderNext);
  };

  window.onclick = () => {
    // audio.play();
    clock.reset();
    requestAnimationFrame(renderNext);
    window.onclick = null;
  };
});
