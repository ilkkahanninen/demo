import { config } from "./config";
import { render } from "./FrameContext";
import { ShaderProgram } from "./ShaderProgram";

export class FrameBuffer {
  gl: WebGL2RenderingContext;
  texture: WebGLTexture;
  framebuffer: WebGLFramebuffer;
  width: number;
  height: number;

  constructor(gl: WebGL2RenderingContext, width: number, height: number) {
    const targetTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, targetTexture);

    const level = 0;
    const internalFormat = gl.RGBA;
    const border = 0;
    const format = gl.RGBA;
    const type = gl.UNSIGNED_BYTE;

    gl.texImage2D(
      gl.TEXTURE_2D,
      level,
      internalFormat,
      width,
      height,
      border,
      format,
      type,
      null
    );

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    const framebuffer = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);

    const attachmentPoint = gl.COLOR_ATTACHMENT0;
    gl.framebufferTexture2D(
      gl.FRAMEBUFFER,
      attachmentPoint,
      gl.TEXTURE_2D,
      targetTexture,
      level
    );

    if (!targetTexture || !framebuffer) {
      throw new Error("Could not create a frame buffer");
    }

    this.gl = gl;
    this.texture = targetTexture;
    this.framebuffer = framebuffer;
    this.width = width;
    this.height = height;
  }

  renderToItself(shader: ShaderProgram, draw: () => void) {
    render(
      shader,
      this.width,
      this.height
    )(() => {
      this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.framebuffer);
      this.gl.viewport(0, 0, this.width, this.height);

      draw();

      this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
      this.gl.viewport(0, 0, config.canvas.width, config.canvas.height);
    });
  }

  useAt(textureSlot: GLenum) {
    this.gl.activeTexture(textureSlot);
    this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture);
  }
}
