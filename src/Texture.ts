import { Resource, ResourcePromise } from "./Resource";

export class Texture extends Resource {
  gl: WebGL2RenderingContext;
  texture: WebGLTexture;

  constructor(gl: WebGL2RenderingContext, url: URL) {
    const texture = gl.createTexture()!;
    super(
      new ResourcePromise((resolve, reject) => {
        const image = new Image();
        image.onload = () => {
          gl.bindTexture(gl.TEXTURE_2D, this.texture);
          gl.texImage2D(
            gl.TEXTURE_2D,
            0,
            gl.RGBA,
            gl.RGBA,
            gl.UNSIGNED_BYTE,
            image
          );
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
          gl.generateMipmap(gl.TEXTURE_2D);

          resolve(this.texture);
        };

        image.onerror = reject;
        image.src = url.href;
      })
    );

    this.gl = gl;
    this.texture = texture;
  }

  useAt(textureSlot: GLenum) {
    this.gl.activeTexture(textureSlot);
    this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture);
  }
}
