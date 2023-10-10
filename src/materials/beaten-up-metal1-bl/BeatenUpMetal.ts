import { Material } from "../../Material";

export const getBeatenUpMetal = (gl: WebGL2RenderingContext) =>
  new Material(gl, {
    albedo: new URL("beaten-up-metal1-albedo.png", import.meta.url),
    metallic: new URL("beaten-up-metal1-Metallic.png", import.meta.url),
    roughness: new URL("beaten-up-metal1-Roughness.png", import.meta.url),
    ao: new URL("beaten-up-metal1-ao.png", import.meta.url),
  });
