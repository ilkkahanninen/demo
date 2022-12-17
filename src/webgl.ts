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
      info
        .split("\n")
        .filter((n) => n.length > 0)
        .forEach((error) => {
          const match = error.match(/ERROR: (\d+):(\d+): (.*)/);
          if (match) {
            const lineNo = parseInt(match[2], 10) - 1;
            console.error(`GLSL error on line ${lineNo}: ${match[3]}`);
            source
              .split("\n")
              .map((s, i) => `${i.toString().padStart(4, " ")}: ${s}`)
              .slice(lineNo - 3, lineNo + 3)
              .map((line, i) => {
                if (i == 3)
                  console.log(`%c${line}`, "color: red; font-weight: bold");
                else console.log(line);
              });
          } else {
            console.error(error);
          }
        });
      throw "An error occurred compiling the shaders";
    }
  }

  return shader;
};
