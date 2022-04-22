export let loadShader = (
  gl: WebGLRenderingContext,
  type: GLenum,
  source: string
): WebGLShader => {
  let shader = gl.createShader(type)!;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (process.env.NODE_ENV !== "production") {
    let info = gl.getShaderInfoLog(shader);

    if (info?.length) {
      gl.deleteShader(shader);
      console.info(
        source
          .split("\n")
          .map((s, i) => `${(i + 1).toString().padStart(4, " ")}: ${s}`)
          .join("\n")
      );
      console.error(info);
      throw "An error occurred compiling the shaders";
    }
  }

  return shader;
};
