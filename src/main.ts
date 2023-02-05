import { Clock } from "./Clock";
import { getMetal } from "./materials/metal/Metal";
import { Rectangle } from "./Rectangle";
import { waitFor } from "./Resource";
import { ShaderProgram } from "./ShaderProgram";
import { normalize, vec3 } from "./vectors";

import { config } from "./config";
import { FrameBuffer } from "./FrameBuffer";
import { renderCanvas } from "./FrameContext";
import ballsShader from "./scene/balls.frag";
import defaultVertexShader from "./scene/default.vert";
import postprocessShader from "./scene/postprocess.frag";

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
const framebuffer = new FrameBuffer(gl, 128, 72);

waitFor(material).then(() => {
  const rect = new Rectangle(gl);

  const balls = new ShaderProgram(gl, defaultVertexShader, ballsShader);
  const postprocess = new ShaderProgram(
    gl,
    defaultVertexShader,
    postprocessShader
  );

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

    // Testi: piirretään framebufferiin

    framebuffer.renderToItself(balls, () => {
      rect.bind(vertexPos, overlayTexturePos);
      balls.useSamplers(
        "ALBEDO_SAMPLER",
        "METALLIC_SAMPLER",
        "ROUGHNESS_SAMPLER",
        "AO_SAMPLER"
      );
      material.useAt(gl.TEXTURE0);

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

      rect.render();
    });

    // Testi: piirretään framebuffer ruudulle

    renderCanvas(postprocess)(() => {
      framebuffer.useAt(gl.TEXTURE0);
      rect.render();
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
