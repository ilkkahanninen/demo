import { play } from "./music";
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
canvas.height = 720;

let gl = canvas.getContext("webgl2")!;

if (process.env.NODE_ENV !== "production") {
  if (!gl) {
    alert(
      "Unable to initialize WebGL. Your browser or machine may not support it."
    );
  }
}

let buffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
let positions = [1.0, 1.0, -1.0, 1.0, 1.0, -1.0, -1.0, -1.0];
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

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
let timeUniform = gl.getUniformLocation(program, "_T");
let audioCtx: AudioContext | undefined;

let renderNext = () => {
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.vertexAttribPointer(vertexPos, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(vertexPos);
  gl.useProgram(program);
  gl.uniform1f(timeUniform, audioCtx!.currentTime / 0.4);
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

  requestAnimationFrame(renderNext);
};

window.onclick = () => {
  audioCtx = play();
  requestAnimationFrame(renderNext);
};
