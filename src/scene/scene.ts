import { initShader } from "../webgl";
const vertShader = require(process.env.NODE_ENV !== "production"
  ? "./scene.vert"
  : "../../dist/intermediate/out.min.vert");

const fragShader = require(process.env.NODE_ENV !== "production"
  ? "./scene.frag"
  : "../../dist/intermediate/out.min.frag");

export type SceneInfo = {
  p: WebGLProgram; // shader program
  v: number; // vertex positions
  r: WebGLUniformLocation | null; // resolution
  t: WebGLUniformLocation | null; // time
};

export function load(gl: WebGLRenderingContext): SceneInfo {
  const program = initShader(gl, vertShader, fragShader);

  return {
    p: program,
    v: gl.getAttribLocation(program, "_V"),
    r: gl.getUniformLocation(program, "_R"),
    t: gl.getUniformLocation(program, "_T"),
  };
}
