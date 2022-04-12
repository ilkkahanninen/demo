import { initShader } from "../webgl";
import fragShader from "./scene.frag";
import vertShader from "./scene.vert";

export type SceneInfo = {
  program: WebGLProgram;
  aVertexPosition: number;
  uResolution: WebGLUniformLocation | null;
  uTime: WebGLUniformLocation | null;
};

export function load(gl: WebGLRenderingContext): SceneInfo {
  const program = initShader(gl, vertShader, fragShader);

  return {
    program,
    aVertexPosition: gl.getAttribLocation(program, "aVertexPosition"),
    uResolution: gl.getUniformLocation(program, "uResolution"),
    uTime: gl.getUniformLocation(program, "uTime"),
  };
}
