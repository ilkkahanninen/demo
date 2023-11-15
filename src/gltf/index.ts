import { readGlbData } from "./loaders/glbReader";
import { GLTF, checkEngineSupport } from "./types/glTF";

export class GlTFAsset {
  json: GLTF;
  bin?: Uint8Array;

  constructor(json: GLTF, bin?: Uint8Array) {
    checkEngineSupport(json);
    this.json = json;
    this.bin = bin;
  }
}

export const fromGltfBinary = (data: ArrayBuffer) => {
  const glb = readGlbData(data);
  return new GlTFAsset(glb.json, glb.bin);
};
