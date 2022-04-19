import { initShader } from "../webgl";
import vertShader from "./scene.vert";

const fragShader = require(process.env.NODE_ENV !== "production"
  ? "./scene.frag"
  : "../../dist/intermediate/out.min.frag");

export type SceneInfo = {
  program: WebGLProgram;
  vertexPosition: number;
  resolution: WebGLUniformLocation | null;
  time: WebGLUniformLocation | null;
};

export function load(gl: WebGLRenderingContext): SceneInfo {
  const program = initShader(gl, vertShader, fragShader);

  return {
    program,
    vertexPosition: gl.getAttribLocation(program, "_V"),
    resolution: gl.getUniformLocation(program, "_R"),
    time: gl.getUniformLocation(program, "_T"),
  };
}
