import { GlTFAsset } from "../index";
import { MeshPrimitive } from "../types/Mesh";
import { GlMaterial } from "./GlMaterial";

export class GlMeshPrimitive {
  vertexBuffer?: WebGLBuffer;
  material?: GlMaterial;

  constructor(
    gl: WebGL2RenderingContext,
    asset: GlTFAsset,
    primitive: MeshPrimitive
  ) {
    if (primitive.indices !== undefined) {
      this.loadVertexBuffer(gl, asset, primitive.indices);
    }
    if (primitive.material !== undefined) {
      this.material = new GlMaterial(
        gl,
        asset,
        asset.getMaterial(primitive.material)
      );
    }
  }

  render(gl: WebGL2RenderingContext) {
    if (this.vertexBuffer) {
      // gl.bindBuffer();
    }
  }

  private loadVertexBuffer(
    gl: WebGL2RenderingContext,
    asset: GlTFAsset,
    indicesIdx: number
  ) {
    const acc = asset.getAccessor(indicesIdx);
    const data = asset.getDataByAccessor(acc);

    this.vertexBuffer = gl.createBuffer()!;
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
  }
}
