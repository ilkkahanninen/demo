import { Clock } from "./Clock";
import { getMetal } from "./materials/metal/Metal";
import { Rectangle } from "./Rectangle";
import { waitFor } from "./Resource";
import { ShaderProgram } from "./ShaderProgram";

let vertShader = require(process.env.NODE_ENV !== "production"
  ? "./scene/scene.vert"
  : "../dist/intermediate/out.min.vert");

let fragShader = require(process.env.NODE_ENV !== "production"
  ? "./scene/scene.frag"
  : "../dist/intermediate/out.min.frag");

document.body.style.background = "#000";
document.body.style.margin = "0";
document.body.style.display = "flex";
document.body.style.alignItems = "center";
document.body.style.height = "100vh";

let canvas = document.querySelector<HTMLCanvasElement>("canvas")!;
canvas.style.width = "100%";
canvas.width = 1280;
canvas.height = 720;

let gl = canvas.getContext("webgl2")!;

if (process.env.NODE_ENV !== "production") {
  if (!gl) {
    alert(
      "Unable to initialize WebGL. Your browser or machine may not support it."
    );
  }
}

const material = getMetal(gl);

waitFor(material).then(() => {
  const rect = new Rectangle(gl);

  const scene = new ShaderProgram(gl, vertShader, fragShader);

  const [vertexPos, overlayTexturePos] = scene.vertexAttributes(
    "VERTEX_POS",
    "OVERLAY_TEXTURE_POS"
  );

  const setTime = scene.float("TIME");

  const clock = new Clock(135);

  const renderNext = () => {
    const time = clock.seconds();

    rect.bind(vertexPos, overlayTexturePos);
    scene.use();
    scene.useSamplers(
      "ALBEDO_SAMPLER",
      "METALLIC_SAMPLER",
      "ROUGHNESS_SAMPLER",
      "AO_SAMPLER"
    );
    setTime(time);

    // setSampler(0);
    material.albedo.use(gl.TEXTURE0);
    material.metallic.use(gl.TEXTURE1);
    material.roughness.use(gl.TEXTURE2);
    material.ao.use(gl.TEXTURE3);

    rect.render();

    requestAnimationFrame(renderNext);
  };

  window.onclick = () => {
    // audio.play();
    clock.reset();
    requestAnimationFrame(renderNext);
    window.onclick = null;
  };
});
