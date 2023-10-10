export class NoiseBuffer {
  gl: WebGL2RenderingContext;
  texture: WebGLTexture;
  size: number;

  constructor(gl: WebGL2RenderingContext, size: number) {
    const targetTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, targetTexture);

    const level = 0;
    const internalFormat = gl.RGBA;
    const border = 0;
    const format = gl.RGBA;
    const type = gl.UNSIGNED_BYTE;

    const data = new Uint8Array(size * size * 4)
      .fill(0)
      .map(() => Math.random() * 255);

    gl.texImage2D(
      gl.TEXTURE_2D,
      level,
      internalFormat,
      size,
      size,
      border,
      format,
      type,
      data
    );

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);

    if (!targetTexture) {
      throw new Error("Could not create a frame buffer");
    }

    this.gl = gl;
    this.texture = targetTexture;
    this.size = size;
  }

  useAt(textureSlot: GLenum) {
    this.gl.activeTexture(textureSlot);
    this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture);
  }
}
