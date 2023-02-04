import { loadShader } from "./webgl";

export type BindFn<T> = (value: T) => void;

export class ShaderProgram {
  gl: WebGL2RenderingContext;
  program: WebGLProgram;

  constructor(
    gl: WebGL2RenderingContext,
    vertexShader: string,
    fragmentShader: string
  ) {
    this.gl = gl;

    const vs = loadShader(gl, gl.VERTEX_SHADER, vertexShader);
    const fs = loadShader(gl, gl.FRAGMENT_SHADER, fragmentShader);

    this.program = gl.createProgram()!;
    gl.attachShader(this.program, vs);
    gl.attachShader(this.program, fs);
    gl.linkProgram(this.program);

    if (!gl.getProgramParameter(this.program, gl.LINK_STATUS)) {
      throw (
        "Unable to initialize the shader program: " +
        gl.getProgramInfoLog(this.program)
      );
    }
  }

  use() {
    this.gl.useProgram(this.program);
  }

  float(name: string): BindFn<number> {
    const location = this.uniform(name);
    return (value: number) => {
      return this.gl.uniform1f(location, value);
    };
  }

  useSamplers(...names: string[]) {
    names.forEach((name, index) => {
      this.sampler(name)(index);
    });
  }

  sampler(name: string): BindFn<number> {
    const location = this.uniform(name);
    return (value: number) => this.gl.uniform1i(location, value);
  }

  uniform(name: string): WebGLUniformLocation | null {
    const location = this.gl.getUniformLocation(this.program, name);
    if (location === null) {
      console.warn(`Uniform ${name} does not exist`);
    }
    return location;
  }

  uniforms(...names: string[]): (WebGLUniformLocation | null)[] {
    return names.map(this.uniform.bind(this));
  }

  vertexAttribute(name: string): number {
    const location = this.gl.getAttribLocation(this.program, name);
    if (location < 0) {
      console.warn(`Vertex attribute ${name} does not exist`);
    }
    return location;
  }

  vertexAttributes(...names: string[]): number[] {
    return names.map(this.vertexAttribute.bind(this));
  }
}
