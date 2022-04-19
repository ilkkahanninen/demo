import { config } from "./config";
import { initMusic } from "./music2";
import { load } from "./scene/scene";
import { initBuffer } from "./webgl";

window.onload = () => {
  const canvas = document.querySelector<HTMLCanvasElement>("#c")!;
  canvas.width = config.resolution[0];
  canvas.height = config.resolution[1];

  const gl = canvas.getContext("webgl2")!;
  if (process.env.NODE_ENV !== "production") {
    if (!gl) {
      return alert(
        "Unable to initialize WebGL. Your browser or machine may not support it."
      );
    }
  }

  const buffer = initBuffer(gl);
  const scene = load(gl);

  const now = (): number => new Date().getTime() / 1000;

  const startTime = now();
  const renderNext = () => {
    const time = now() - startTime;

    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.vertexAttribPointer(scene.vertexPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(scene.vertexPosition);
    gl.useProgram(scene.program);
    gl.uniform2fv(scene.resolution, config.resolution);
    gl.uniform1f(scene.time, time);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

    requestAnimationFrame(renderNext);
  };

  renderNext();

  document.body.addEventListener("click", () => {
    initMusic();
  });
};
