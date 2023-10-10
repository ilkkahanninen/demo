import { config } from "./config";
import { ShaderProgram } from "./ShaderProgram";

export type FrameContext = {
  readonly width: number;
  readonly height: number;
  readonly shader: ShaderProgram;
};

let currentContext: FrameContext | null = null;

export const getCurrentContext = () => currentContext;

export const render =
  (shader: ShaderProgram, width: number, height: number) =>
  (draw: () => void) => {
    if (currentContext) {
      throw new Error("Do not call render inside render");
    }
    currentContext = { shader, width, height };

    shader.use();
    shader.setResolution(width, height);

    draw();

    currentContext = null;
  };

export const renderCanvas = (shader: ShaderProgram) =>
  render(shader, config.canvas.width, config.canvas.height);
