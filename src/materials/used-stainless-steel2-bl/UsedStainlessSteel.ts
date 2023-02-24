import { Material } from "../../Material";

export const getUsedStainlessSteel = (gl: WebGL2RenderingContext) =>
  new Material(gl, {
    albedo: new URL("used-stainless-steel2_albedo.png", import.meta.url),
    metallic: new URL("used-stainless-steel2_metallic.png", import.meta.url),
    roughness: new URL("used-stainless-steel2_roughness.png", import.meta.url),
    ao: new URL("used-stainless-steel2_ao.png", import.meta.url),
  });
