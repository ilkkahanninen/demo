import { GlTFAsset } from "../index";
import { Material } from "../types/Material";
import { FixedLengthArray } from "../types/common";
import { GlTexture } from "./GlTexture";

export class GlMaterial {
  baseColorFactor: FixedLengthArray<number, 4>;
  baseColorTexture?: GlTexture;
  metallicRoughnessTexture?: GlTexture;
  metallicFactor: number;
  roughnessFactor: number;
  emissiveFactor: FixedLengthArray<number, 3>;
  emissiveTexture?: GlTexture;
  normalTexture?: GlTexture;
  normalScale?: number;

  constructor(
    gl: WebGL2RenderingContext,
    asset: GlTFAsset,
    material: Material
  ) {
    console.log("Load material", material);

    const pbr = material.pbrMetallicRoughness;
    this.baseColorFactor = pbr?.baseColorFactor ?? [1, 1, 1, 1];
    this.metallicFactor = pbr?.metallicFactor ?? 1;
    this.roughnessFactor = pbr?.roughnessFactor ?? 1;

    if (pbr?.baseColorTexture) {
      this.baseColorTexture = GlTexture.fromTextureInfo(
        gl,
        asset,
        pbr.baseColorTexture
      );
    }
    if (pbr?.metallicRoughnessTexture) {
      this.metallicRoughnessTexture = GlTexture.fromTextureInfo(
        gl,
        asset,
        pbr.metallicRoughnessTexture
      );
    }
    if (material.normalTexture) {
      this.normalTexture = GlTexture.fromTextureInfo(
        gl,
        asset,
        material.normalTexture
      );
      this.normalScale = material.normalTexture.scale ?? 1;
    }

    this.emissiveFactor = material.emissiveFactor ?? [0, 0, 0];
    if (material.emissiveTexture) {
      this.emissiveTexture = GlTexture.fromTextureInfo(
        gl,
        asset,
        material.emissiveTexture
      );
    }
  }
}
