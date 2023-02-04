import { Clock } from "./Clock";
import { loadTextures } from "./images/index";
import { Rectangle } from "./Rectangle";
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

Promise.all([loadTextures(gl) /* loadAudio() */]).then(
  ([textures /*audio*/]) => {
    const rect = new Rectangle(gl);
    const scene = new ShaderProgram(gl, vertShader, fragShader);

    const [vertexPos, texturePos] = scene.vertexAttributes(
      "VERTEX_POS",
      "TEXTURE_POS"
    );
    // const setSampler = scene.sampler("SAMPLER");

    const setTime = scene.float("TIME");

    const clock = new Clock(135);

    const renderNext = () => {
      const time = clock.seconds();

      rect.bind(vertexPos, texturePos);
      scene.use();

      setTime(time);

      // const overlayImage = imageScript.find(
      //   (s) => s.begin <= timeInSeconds && s.end > timeInSeconds
      // );
      // gl.activeTexture(gl.TEXTURE0);
      // if (overlayImage) {
      //   gl.enableVertexAttribArray(texturePos);
      //   gl.bindTexture(gl.TEXTURE_2D, textures[overlayImage.index]);
      //   gl.uniform1i(sampler, 0);
      // } else {
      //   gl.disableVertexAttribArray(texturePos);
      // }
      // setSampler(0);

      rect.render();

      requestAnimationFrame(renderNext);
    };

    window.onclick = () => {
      // audio.play();
      clock.reset();
      requestAnimationFrame(renderNext);
      window.onclick = null;
    };
  }
);
