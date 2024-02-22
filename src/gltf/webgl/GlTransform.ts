import {
  Mat4x4,
  Vec3,
  Vec4,
  identityMatrix,
  multiplyMatrices,
  rotationMatrix,
  scaleMatrix,
  translationMatrix,
} from "../../vectors";
import { Node } from "../types/Node";

export const createTransform = (node: Node) =>
  "matrix" in node ? new GlMatrixTransform(node) : new GlTrsTransform(node);

export interface GlTransform {
  matrix: Mat4x4;
}

export class GlTrsTransform implements GlTransform {
  translation: Vec3;
  rotation: Vec4;
  scale: Vec3;
  matrix: Mat4x4;

  constructor(node: Node) {
    this.translation = (node.translation as Vec3) ?? [0, 0, 0];
    this.rotation = (node.rotation as Vec4) ?? [0, 0, 0, 1];
    this.scale = (node.scale as Vec3) ?? [1, 1, 1];
    this.matrix = this.getMatrix();
  }

  getMatrix(): Mat4x4 {
    const t = translationMatrix(this.translation);
    const r = rotationMatrix(this.rotation);
    const s = scaleMatrix(this.scale);
    return multiplyMatrices(s, r, t);
  }
}

export class GlMatrixTransform implements GlTransform {
  matrix: Mat4x4;

  constructor(node: Node) {
    this.matrix = (node.matrix as Mat4x4) ?? identityMatrix;
  }
}
