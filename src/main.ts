import { config } from "./config";
import { initMusic } from "./music2";
import { load, SceneInfo } from "./scene/scene";
import { initBuffer } from "./webgl";

window.onload = main;

function main() {
  const canvas = document.querySelector<HTMLCanvasElement>("#c")!;
  canvas.width = config.resolution[0];
  canvas.height = config.resolution[1];

  const gl = canvas.getContext("webgl");
  if (!gl) {
    return alert(
      "Unable to initialize WebGL. Your browser or machine may not support it."
    );
  }

  const buffer = initBuffer(gl);
  const scene = load(gl);

  const startTime = now();
  const renderNext = () => {
    render(gl, scene, buffer, now() - startTime);
    requestAnimationFrame(renderNext);
  };

  renderNext();

  document.body.addEventListener("click", () => {
    initMusic();
  });
}

function now(): number {
  return new Date().getTime() / 1000;
}

function render(
  gl: WebGLRenderingContext,
  scene: SceneInfo,
  buffer: WebGLBuffer,
  time: number
) {
  gl.clearColor(0, 0, 0, 1);
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.vertexAttribPointer(scene.aVertexPosition, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(scene.aVertexPosition);
  gl.useProgram(scene.program);
  gl.uniform2fv(scene.uResolution, config.resolution);
  gl.uniform1f(scene.uTime, time);
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
}
