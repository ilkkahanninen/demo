import { Material } from "../../Material";

export const getStreakedMetal = (gl: WebGL2RenderingContext) =>
  new Material(gl, {
    albedo: new URL("streakedmetal-albedo.png", import.meta.url),
    metallic: new URL("streakedmetal-metalness.png", import.meta.url),
    roughness: new URL("streakedmetal-roughness.png", import.meta.url),
    ao: new URL("streakedmetal-albedo.png", import.meta.url),
  });
