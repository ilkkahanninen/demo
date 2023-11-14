import { Extension, Extras, NonEmptyArray } from "./common";

/**
 * Joints and matrices defining a skin.
 */
export type Skin = {
  /**
   * The index of the accessor containing the floating-point 4x4 inverse-bind matrices. Its accessor.count property MUST
   * be greater than or equal to the number of elements of the joints array. When undefined, each matrix is
   * a 4x4 identity matrix.
   */
  inverseBindMatrices?: number;
  /**
   * The index of the node used as a skeleton root. The node MUST be the closest common root of the joints hierarchy or
   * a direct or indirect parent node of the closest common root.
   */
  skeleton?: number;
  /**
   * Indices of skeleton nodes, used as joints in this skin.
   */
  joints: NonEmptyArray<number>;
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
