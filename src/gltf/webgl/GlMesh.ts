import { GlTFAsset } from "../index";
import { Mesh } from "../types/Mesh";
import { GlMeshPrimitive } from "./GlMeshPrimitive";

export class GlMesh {
  primitives: GlMeshPrimitive[];

  constructor(gl: WebGL2RenderingContext, asset: GlTFAsset, mesh: Mesh) {
    this.primitives = mesh.primitives.map(
      (primitive) => new GlMeshPrimitive(gl, asset, primitive)
    );
  }
}
