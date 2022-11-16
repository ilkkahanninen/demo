import { loadAudio } from "./audio";
import { imageScript, imageTime, loadTextures } from "./images/index";
import { loadShader } from "./webgl";

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
canvas.height = 500;

let gl = canvas.getContext("webgl2")!;

if (process.env.NODE_ENV !== "production") {
  if (!gl) {
    alert(
      "Unable to initialize WebGL. Your browser or machine may not support it."
    );
  }
}

Promise.all([loadTextures(gl), loadAudio()]).then(([textures, audio]) => {
  let buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);

  let vertexPositions = [1.0, 1.0, -1.0, 1.0, 1.0, -1.0, -1.0, -1.0];
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array(vertexPositions),
    gl.STATIC_DRAW
  );

  let texturePositions = [1, 0, 0, 0, 1, 1, 0, 1];
  let textureCoordBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, textureCoordBuffer);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array(texturePositions),
    gl.STATIC_DRAW
  );

  let vertexShader = loadShader(gl, gl.VERTEX_SHADER, vertShader);
  let fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fragShader);

  let program = gl.createProgram()!;
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);

  if (process.env.NODE_ENV !== "production") {
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      throw (
        "Unable to initialize the shader program: " +
        gl.getProgramInfoLog(program)
      );
    }
  }

  let vertexPos = gl.getAttribLocation(program, "_V");
  let texturePos = gl.getAttribLocation(program, "_I");
  let timeUniform = gl.getUniformLocation(program, "_T");
  let sampler = gl.getUniformLocation(program, "_S");
  let random = gl.getUniformLocation(program, "_R");
  let imageEffect = gl.getUniformLocation(program, "_I");
  let startTime = 0;
  let prevTime = 0;

  gl.bindBuffer(gl.ARRAY_BUFFER, textureCoordBuffer);
  gl.vertexAttribPointer(texturePos, 2, gl.FLOAT, false, 0, 0);

  let renderNext = () => {
    const time = new Date().getTime() - startTime;
    prevTime = time;
    const timeInSeconds = time * 0.001;

    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.vertexAttribPointer(vertexPos, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vertexPos);
    gl.useProgram(program);
    gl.uniform1f(timeUniform, time * 0.0001);
    gl.uniform1f(random, Math.random());

    const overlayImage = imageScript.find(
      (s) => s.begin <= timeInSeconds && s.end > timeInSeconds
    );
    gl.activeTexture(gl.TEXTURE0);
    if (overlayImage) {
      gl.enableVertexAttribArray(texturePos);
      gl.bindTexture(gl.TEXTURE_2D, textures[overlayImage.index]);
      gl.uniform1i(sampler, 0);
      gl.uniform1f(imageEffect, imageTime(overlayImage, timeInSeconds));
    } else {
      gl.disableVertexAttribArray(texturePos);
    }

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

    requestAnimationFrame(renderNext);
  };

  window.onclick = () => {
    audio.play();
    startTime = new Date().getTime();
    requestAnimationFrame(renderNext);
    window.onclick = null;
  };
});
