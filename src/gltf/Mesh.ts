import {
  Extension,
  Extras,
  LINES,
  LINE_LOOP,
  LINE_STRIP,
  NonEmptyArray,
  POINTS,
  TRIANGLES,
  TRIANGLE_FAN,
  TRIANGLE_STRIP,
} from "./common";

/**
 * A set of primitives to be rendered. Its global transform is defined by a node that references it.
 */
export type Mesh = {
  /**
   * An array of primitives, each defining geometry to be rendered.
   */
  primitives: NonEmptyArray<MeshPrimitive>;
  /**
   * Array of weights to be applied to the morph targets. The number of array elements MUST match the number of morph targets.
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

/**
 * Geometry to be rendered with the given material.
 */
export type MeshPrimitive = {
  /**
   * A plain JSON object, where each key corresponds to a mesh attribute semantic and each value is the index of
   * the accessor containing attribute’s data.
   */
  attributes: object;
  /**
   * The index of the accessor that contains the vertex indices. When this is undefined, the primitive define
   * non-indexed geometry. When defined, the accessor MUST have SCALAR type and an unsigned integer component type.
   */
  indices?: number;
  /**
   * The index of the material to apply to this primitive when rendering.
   */
  material?: number;
  /**
   * The topology type of primitives to render. Default is TRIANGLES.
   */
  mode?:
    | POINTS
    | LINES
    | LINE_LOOP
    | LINE_STRIP
    | TRIANGLES
    | TRIANGLE_STRIP
    | TRIANGLE_FAN;
  /**
   * An array of morph targets.
   */
  targets?: NonEmptyArray<object>;
  /**
   * JSON object with extension-specific objects.
   */
  extensions?: Extension;
  /**
   * Application-specific data.
   */
  extras?: Extras;
};
