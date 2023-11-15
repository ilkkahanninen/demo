import { fetchGlbFile, readGlbData } from "./loaders/glbReader";
import { Accessor } from "./types/Accessor";
import { Buffer, BufferView } from "./types/Buffer";
import { Image } from "./types/Image";
import { Material } from "./types/Material";
import { Mesh } from "./types/Mesh";
import { Node } from "./types/Node";
import { Sampler } from "./types/Sampler";
import { Texture } from "./types/Texture";
import { initError, unsupported } from "./types/common";
import { GLTF, checkEngineSupport } from "./types/glTF";
import { GlNode } from "./webgl/GlNode";

export class GlTFAsset {
  gl: WebGL2RenderingContext;
  json: GLTF;
  bin?: Uint8Array;

  constructor(gl: WebGL2RenderingContext, json: GLTF, bin?: Uint8Array) {
    checkEngineSupport(json);
    this.gl = gl;
    this.json = json;
    this.bin = bin;
  }

  loadScene(sceneIdx = this.json.scene) {
    const scene = this.json.scenes?.[sceneIdx || 0];
    if (!scene) throw Error(`Scene #${sceneIdx} not found`);

    for (let nodeIdx of scene.nodes || []) {
      const node = new GlNode(this.gl, this, this.getNode(nodeIdx));
      console.log(node);
    }
  }

  getAccessor(index: number): Accessor {
    const accessor = this.json.accessors?.[index];
    if (!accessor) {
      throw initError(`Accessor #${index} does not exist`);
    }
    return accessor;
  }

  getNode(index: number): Node {
    const node = this.json.nodes?.[index];
    if (!node) {
      throw initError(`Node #${index} does not exist`);
    }
    return node;
  }

  getMesh(index: number): Mesh {
    const mesh = this.json.meshes?.[index];
    if (!mesh) {
      throw initError(`Mesh #${index} does not exist`);
    }
    return mesh;
  }

  getBuffer(index: number): Buffer {
    const buffer = this.json.buffers?.[index];
    if (!buffer) {
      throw initError(`Buffer #${index} does not exist`);
    }
    return buffer;
  }

  getBufferView(index: number): BufferView {
    const view = this.json.bufferViews?.[index];
    if (!view) {
      throw initError(`Buffer view #${index} does not exist`);
    }
    return view;
  }

  getMaterial(index: number): Material {
    const material = this.json.materials?.[index];
    if (!material) {
      throw initError(`Material #${index} does not exist`);
    }
    return material;
  }

  getTexture(index: number): Texture {
    const texture = this.json.textures?.[index];
    if (!texture) {
      throw initError(`Texture #${index} does not exist`);
    }
    return texture;
  }

  getImage(index: number): Image {
    const image = this.json.images?.[index];
    if (!image) {
      throw initError(`Image #${index} does not exist`);
    }
    return image;
  }

  getSampler(index: number): Sampler {
    const sampler = this.json.samplers?.[index];
    if (!sampler) {
      throw initError(`Sampler #${index} does not exist`);
    }
    return sampler;
  }

  getData(view: BufferView): Uint8Array {
    const buffer = this.getBuffer(view.buffer);
    if (buffer.uri) {
      throw unsupported(
        "Data form external files or data-uris not implemented"
      );
    }
    if (!this.bin) {
      throw unsupported("Cannot load data without binary buffer");
    }
    return new Uint8Array(this.bin, view.byteOffset, view.byteLength);
  }

  getDataByAccessor(accessor: Accessor): Uint8Array {
    if (accessor.bufferView !== undefined) {
      return this.getData(this.getBufferView(accessor.bufferView));
    } else {
      throw unsupported("Nil data buffers not implemented");
    }
  }
}

export const fromGltfBinary = (
  gl: WebGL2RenderingContext,
  data: ArrayBuffer
) => {
  const glb = readGlbData(data);
  return new GlTFAsset(gl, glb.json, glb.bin);
};

export const fromGltfBinaryUrl = async (
  gl: WebGL2RenderingContext,
  url: URL
) => {
  const glb = await fetchGlbFile(url);
  return new GlTFAsset(gl, glb.json, glb.bin);
};
