import { GlTFAsset } from "../index";
import { Node } from "../types/Node";
import { GlMesh } from "./GlMesh";

export class GlNode {
  mesh?: GlMesh;
  children: GlNode[];

  constructor(gl: WebGL2RenderingContext, asset: GlTFAsset, node: Node) {
    this.mesh =
      node.mesh !== undefined
        ? new GlMesh(gl, asset, asset.getMesh(node.mesh))
        : undefined;

    this.children = [];
    for (let childIndex of node.children ?? []) {
      this.children.push(new GlNode(gl, asset, asset.getNode(childIndex)));
    }
  }
}
