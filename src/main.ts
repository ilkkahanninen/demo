import { Clock } from "./Clock";
import { getMetal } from "./materials/metal/Metal";
import { Rectangle } from "./Rectangle";
import { waitFor } from "./Resource";
import { ShaderProgram } from "./ShaderProgram";
import { normalize, vec3 } from "./vectors";

import { config } from "./config";
import { CubeMapBuffer } from "./CubemapBuffer";
import { FrameBuffer } from "./FrameBuffer";
import { renderCanvas } from "./FrameContext";
import defaultVertexSrc from "./scene/default.vert";
import pallotTunnelissaSrc from "./scene/pallotTunnelissa.frag";
import pallotTunnelissaEnvSrc from "./scene/pallotTunnelissaEnv.frag";
import postprocessSrc from "./scene/postprocess.frag";

document.body.style.background = "#000";
document.body.style.margin = "0";
document.body.style.display = "flex";
document.body.style.alignItems = "center";
document.body.style.height = "100vh";

let canvas = document.querySelector<HTMLCanvasElement>("canvas")!;
canvas.style.width = "100%";
canvas.width = config.canvas.width;
canvas.height = config.canvas.height;

let gl = canvas.getContext("webgl2")!;

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

waitFor(material).then(() => {
  const screen = new Rectangle(gl);

  const balls = new ShaderProgram(gl, defaultVertexSrc, pallotTunnelissaSrc);

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
    pallotTunnelissaEnvSrc
  );

  ballsEnv.setupSamplers(
    "ALBEDO_SAMPLER",
    "METALLIC_SAMPLER",
    "ROUGHNESS_SAMPLER",
    "AO_SAMPLER"
  );

  const postprocess = new ShaderProgram(gl, defaultVertexSrc, postprocessSrc);

  const [vertexPos, overlayTexturePos] = balls.vertexAttributes(
    "VERTEX_POS",
    "OVERLAY_TEXTURE_POS"
  );

  const setTime = balls.float("TIME");
  const setCameraPos = balls.vec3("CAMERA_POS");
  const setCameraLookAt = balls.vec3("CAMERA_LOOKAT");
  const setCameraUp = balls.vec3("CAMERA_UP");

  const clock = new Clock(135);

  const renderNext = () => {
    const time = clock.seconds();
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

    // Testi: piirretään framebufferiin
    framebuffer.renderToItself(balls, () => {
      material.bindAt(gl.TEXTURE0);
      environmentMap.bindAt(gl.TEXTURE4);

      setTime(time);

      setCameraPos(
        vec3(
          1.6 * 2.3 * Math.cos(time * 8.0),
          1.6 * Math.cos(time * 6.0),
          1.6 * 1.3 * Math.sin(time * 8.0)
        )
      );
      setCameraUp(
        normalize(
          vec3(
            Math.sin(time * 0.1),
            Math.cos(time * 0.12),
            Math.sin(time * 0.17)
          )
        )
      );
      setCameraLookAt(vec3(1.5 * Math.cos(time * 2.0), 0.0, 0.0));

      screen.render();
    });

    // Testi: piirretään framebuffer ruudulle

    renderCanvas(postprocess)(() => {
      framebuffer.useAt(gl.TEXTURE0);
      screen.render();
    });

    requestAnimationFrame(renderNext);
  };

  window.onclick = () => {
    // audio.play();
    clock.reset();
    requestAnimationFrame(renderNext);
    window.onclick = null;
  };
});
