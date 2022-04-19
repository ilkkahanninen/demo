export function initBuffer(gl: WebGLRenderingContext): WebGLBuffer {
  const positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

  const positions = [1.0, 1.0, -1.0, 1.0, 1.0, -1.0, -1.0, -1.0];

  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

  return positionBuffer!;
}

export function initShader(
  gl: WebGLRenderingContext,
  vsSource: string,
  fsSource: string
): WebGLProgram {
  const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
  const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);

  const shaderProgram = gl.createProgram()!;
  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragmentShader);
  gl.linkProgram(shaderProgram);

  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    throw (
      "Unable to initialize the shader program: " +
      gl.getProgramInfoLog(shaderProgram)
    );
  }

  return shaderProgram;
}

export function loadShader(
  gl: WebGLRenderingContext,
  type: GLenum,
  source: string
): WebGLShader {
  const shader = gl.createShader(type)!;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (process.env.NODE_ENV !== "production") {
    const info = gl.getShaderInfoLog(shader);

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
}
