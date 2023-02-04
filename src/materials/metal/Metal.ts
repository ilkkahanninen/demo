import { Material } from "../../Material";

export const getMetal = (gl: WebGL2RenderingContext) =>
  new Material(gl, {
    albedo: new URL("metal_0004_albedo.jpg", import.meta.url),
    metallic: new URL("metal_0004_metallic.jpg", import.meta.url),
    roughness: new URL("metal_0004_roughness.jpg", import.meta.url),
    ao: new URL("metal_0004_ao.jpg", import.meta.url),
  });
