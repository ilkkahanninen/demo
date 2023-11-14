import { Extension, Extras, FixedLengthArray, NonEmptyArray } from "./common";

/**
 * A node in the node hierarchy. When the node contains skin, all mesh.primitives MUST contain JOINTS_0 and WEIGHTS_0 attributes.
 * A node MAY have either a matrix or any combination of translation/rotation/scale (TRS) properties.
 * TRS properties are converted to matrices and postmultiplied in the T * R * S order to compose the transformation matrix;
 * first the scale is applied to the vertices, then the rotation, and then the translation. If none are provided,
 * the transform is the identity. When a node is targeted for animation (referenced by an animation.channel.target),
 * matrix MUST NOT be present.
 */
export type Node = {
  /**
   * The index of the camera referenced by this node.
   */
  camera?: number;
  /**
   * The indices of this node’s children.
   */
  children?: NonEmptyArray<number>;
  /**
   * The index of the skin referenced by this node. When a skin is referenced by a node within a scene,
   * all joints used by the skin MUST belong to the same scene. When defined, mesh MUST also be defined.
   */
  skin?: number;
  /**
   * A floating-point 4x4 transformation matrix stored in column-major order.
   */
  matrix?: FixedLengthArray<number, 16>;
  /**
   * The index of the mesh in this node.
   */
  mesh?: number;
  /**
   * The node’s unit quaternion rotation in the order (x, y, z, w), where w is the scalar.
   */
  rotation?: FixedLengthArray<number, 4>;
  /**
   * The node’s non-uniform scale, given as the scaling factors along the x, y, and z axes.
   */
  scale?: FixedLengthArray<number, 3>;
  /**
   * The node’s translation along the x, y, and z axes.
   */
  translation?: FixedLengthArray<number, 3>;
  /**
   * The weights of the instantiated morph target. The number of array elements MUST match the number of
   * morph targets of the referenced mesh. When defined, mesh MUST also be defined.
   */
  weights?: NonEmptyArray<number>;
  /**
   * The user-defined name of this object. This is not necessarily unique, e.g., an accessor and a buffer could have the same name,
   * or two accessors could even have the same name.
   */
  name?: string;
  /**
   * JSON object with extension-specific objects.
   */
  extensions?: Extension;
  /**
   * Application-specific data.
   */
  extras?: Extras;
};
