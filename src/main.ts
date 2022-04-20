import { play } from "./music";
import { initShader } from "./webgl";

const vertShader = require(process.env.NODE_ENV !== "production"
  ? "./scene/scene.vert"
  : "../dist/intermediate/out.min.vert");

const fragShader = require(process.env.NODE_ENV !== "production"
  ? "./scene/scene.frag"
  : "../dist/intermediate/out.min.frag");

(() => {
  const canvas = document.querySelector<HTMLCanvasElement>("#c")!;
  canvas.width = 1280;
  canvas.height = 720;

  const gl = canvas.getContext("webgl2")!;
  if (process.env.NODE_ENV !== "production") {
    if (!gl) {
      return alert(
        "Unable to initialize WebGL. Your browser or machine may not support it."
      );
    }
  }

  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  const positions = [1.0, 1.0, -1.0, 1.0, 1.0, -1.0, -1.0, -1.0];
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

  const program = initShader(gl, vertShader, fragShader);
  const vertexPos = gl.getAttribLocation(program, "_V");
  const timeUniform = gl.getUniformLocation(program, "_T");

  const renderNext = (time: DOMHighResTimeStamp) => {
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.vertexAttribPointer(vertexPos, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vertexPos);
    gl.useProgram(program);
    gl.uniform1f(timeUniform, time * 0.001 * (0.25 / 0.2));
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

    requestAnimationFrame(renderNext);
  };

  let playing = false;
  window.addEventListener("click", () => {
    if (!playing) {
      play();
      requestAnimationFrame(renderNext);
      playing = true;
    }
  });
})();
