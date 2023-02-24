import { Material } from "../../Material";

export const getRustingLinedMetal = (gl: WebGL2RenderingContext) =>
  new Material(gl, {
    albedo: new URL("rusting-lined-metal2_albedo.png", import.meta.url),
    metallic: new URL("rusting-lined-metal2_metallic.png", import.meta.url),
    roughness: new URL("rusting-lined-metal2_roughness.png", import.meta.url),
    ao: new URL("rusting-lined-metal2_ao.png", import.meta.url),
  });
