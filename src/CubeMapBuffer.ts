import { render } from "./FrameContext";
import { ShaderProgram } from "./ShaderProgram";
import { vec3, Vec3 } from "./vectors";

type Side = {
  target: GLenum;
  direction: Vec3;
  up: Vec3;
};

export class CubeMapBuffer {
  gl: WebGL2RenderingContext;
  cubeMap: WebGLTexture;
  framebuffer: WebGLFramebuffer;
  size: number;
  sides: Side[];

  constructor(gl: WebGL2RenderingContext, size: number) {
    const cubeMap = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, cubeMap);

    this.sides = [
      {
        target: gl.TEXTURE_CUBE_MAP_POSITIVE_X,
        direction: vec3(-1.0, 0.0, 0.0),
        up: vec3(0.0, 1.0, 0.0),
      },
      {
        target: gl.TEXTURE_CUBE_MAP_NEGATIVE_X,
        direction: vec3(1.0, 0.0, 0.0),
        up: vec3(0.0, 1.0, 0.0),
      },
      {
        target: gl.TEXTURE_CUBE_MAP_POSITIVE_Y,
        direction: vec3(0.0, -1.0, 0.0),
        up: vec3(0.0, 0.0, 1.0),
      },
      {
        target: gl.TEXTURE_CUBE_MAP_NEGATIVE_Y,
        direction: vec3(0.0, 1.0, 0.0),
        up: vec3(0.0, 0.0, -1.0),
      },
      {
        target: gl.TEXTURE_CUBE_MAP_POSITIVE_Z,
        direction: vec3(0.0, 0.0, 1.0),
        up: vec3(0.0, 1.0, 0.0),
      },
      {
        target: gl.TEXTURE_CUBE_MAP_NEGATIVE_Z,
        direction: vec3(0.0, 0.0, -1.0),
        up: vec3(0.0, 1.0, 0.0),
      },
    ];

    const framebuffer = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);

    this.sides.forEach((camera) => {
      const level = 0;
      const internalFormat = gl.RGBA;
      const border = 0;
      const format = gl.RGBA;
      const type = gl.UNSIGNED_BYTE;

      gl.texImage2D(
        camera.target,
        level,
        internalFormat,
        size,
        size,
        border,
        format,
        type,
        null
      );
    });

    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

    if (!cubeMap || !framebuffer) {
      throw new Error("Could not create a cube map buffer");
    }

    this.gl = gl;
    this.cubeMap = cubeMap;
    this.size = size;
    this.framebuffer = framebuffer;
  }

  renderToItself(
    shader: ShaderProgram,
    draw: (cameraDirection: Vec3, up: Vec3) => void
  ) {
    render(
      shader,
      this.size,
      this.size
    )(() => {
      const gl = this.gl;
      gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.framebuffer);
      gl.viewport(0, 0, this.size, this.size);

      this.sides.forEach((side, index) => {
        gl.framebufferTexture2D(
          gl.FRAMEBUFFER,
          gl.COLOR_ATTACHMENT0,
          side.target,
          this.cubeMap,
          0
        );
        // if (index > 1) {
        //   const n = index + 1;
        //   gl.clearColor(n & 1, (n >> 1) & 1, (n >> 2) & 1, 1.0);
        //   gl.clear(gl.COLOR_BUFFER_BIT);
        // } else {
        draw(side.direction, side.up);
        // }
      });

      gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
      gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    });
  }

  bindAt(textureSlot: GLenum) {
    this.gl.activeTexture(textureSlot);
    this.gl.bindTexture(this.gl.TEXTURE_CUBE_MAP, this.cubeMap);
  }
}
