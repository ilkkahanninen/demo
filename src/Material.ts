import { Resource } from "./Resource";
import { Texture } from "./Texture";

export type MaterialURLs = {
  albedo: URL;
  metallic: URL;
  roughness: URL;
  ao: URL;
};

export class Material extends Resource {
  gl: WebGL2RenderingContext;
  albedo: Texture;
  metallic: Texture;
  roughness: Texture;
  ao: Texture;

  constructor(gl: WebGL2RenderingContext, urls: MaterialURLs) {
    const albedo = new Texture(gl, urls.albedo);
    const metallic = new Texture(gl, urls.metallic);
    const roughness = new Texture(gl, urls.roughness);
    const ao = new Texture(gl, urls.ao);

    super(albedo, metallic, roughness, ao);

    this.gl = gl;
    this.albedo = albedo;
    this.metallic = metallic;
    this.roughness = roughness;
    this.ao = ao;
  }

  use(firstTextureSlot: GLenum) {
    this.albedo.use(firstTextureSlot);
    this.metallic.use(firstTextureSlot + 1);
    this.roughness.use(firstTextureSlot + 2);
    this.ao.use(firstTextureSlot + 3);
  }
}
