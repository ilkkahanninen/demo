import {
  BYTE,
  Extension,
  Extras,
  FLOAT,
  SHORT,
  UNSIGNED_BYTE,
  UNSIGNED_INT,
  UNSIGNED_SHORT,
} from "./common";

WebGL2RenderingContext.INT;

/**
 * A typed view into a buffer view that contains raw binary data.
 */
export type Accessor = {
  /**
   * The index of the buffer view. When undefined, the accessor MUST be initialized with zeros;
   * sparse property or extensions MAY override zeros with actual values.
   */
  bufferView?: number;
  /**
   * The offset relative to the start of the buffer view in bytes. This MUST be a multiple of the size of the component datatype.
   * This property MUST NOT be defined when bufferView is undefined.
   */
  byteOffset?: number;
  /**
   * The datatype of the accessor’s components. UNSIGNED_INT type MUST NOT be used for any accessor that is not referenced by
   * mesh.primitive.indices.
   */
  componentType:
    | BYTE
    | UNSIGNED_BYTE
    | SHORT
    | UNSIGNED_SHORT
    | UNSIGNED_INT
    | FLOAT;
  /**
   * Specifies whether integer data values are normalized (true) to [0, 1] (for unsigned types) or to [-1, 1] (for signed types)
   * when they are accessed. This property MUST NOT be set to true for accessors with FLOAT or UNSIGNED_INT component type.
   */
  normalized?: boolean;
  /**
   * The number of elements referenced by this accessor, not to be confused with the number of bytes or number of components.
   */
  count: number;
  /**
   * Specifies if the accessor’s elements are scalars, vectors, or matrices.
   */
  type: AccessorType;
  /**
   * Maximum value of each component in this accessor. Array elements MUST be treated as having the same data type as accessor’s
   * componentType. Both min and max arrays have the same length. The length is determined by the value of the type property;
   * it can be 1, 2, 3, 4, 9, or 16.
   *
   * normalized property has no effect on array values: they always correspond to the actual values stored in the buffer.
   * When the accessor is sparse, this property MUST contain maximum values of accessor data with sparse substitution applied.
   */
  max?: number;
  /**
   * Minimum value of each component in this accessor. Array elements MUST be treated as having the same data type as accessor’s
   * componentType. Both min and max arrays have the same length. The length is determined by the value of the type property;
   * it can be 1, 2, 3, 4, 9, or 16.
   *
   * normalized property has no effect on array values: they always correspond to the actual values stored in the buffer.
   * When the accessor is sparse, this property MUST contain minimum values of accessor data with sparse substitution applied.
   */
  min?: number;
  /**
   * Sparse storage of elements that deviate from their initialization value.
   */
  sparse?: AccessorSparse;
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

export type AccessorType =
  | "SCALAR"
  | "VEC2"
  | "VEC3"
  | "VEC4"
  | "MAT2"
  | "MAT3"
  | "MAT4";

/**
 * Sparse storage of accessor values that deviate from their initialization value.
 */
export type AccessorSparse = {
  /**
   * Number of deviating accessor values stored in the sparse array.
   */
  count: number;
  /**
   * An object pointing to a buffer view containing the indices of deviating accessor values.
   * The number of indices is equal to count. Indices MUST strictly increase.
   */
  indices: AccessorSparseIndices;
  /**
   * An object pointing to a buffer view containing the deviating accessor values.
   */
  values: AccessorSparseValues;
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
 * An object pointing to a buffer view containing the indices of deviating accessor values.
 * The number of indices is equal to accessor.sparse.count. Indices MUST strictly increase.
 */
export type AccessorSparseIndices = {
  /**
   * The index of the buffer view with sparse indices. The referenced buffer view MUST NOT have its target or
   * byteStride properties defined. The buffer view and the optional byteOffset MUST be aligned to the componentType byte length.
   */
  bufferView: number;
  /**
   * The offset relative to the start of the buffer view in bytes.
   */
  byteOffset?: number;
  /**
   * The indices data type.
   */
  componentType: BYTE | UNSIGNED_SHORT | UNSIGNED_INT;
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
 * An object pointing to a buffer view containing the deviating accessor values.
 * The number of elements is equal to accessor.sparse.count times number of components.
 * The elements have the same component type as the base accessor. The elements are tightly packed.
 * Data MUST be aligned following the same rules as the base accessor.
 */
export type AccessorSparseValues = {
  /**
   * The index of the bufferView with sparse values. The referenced buffer view MUST NOT have its target
   * or byteStride properties defined.
   */
  bufferView: number;
  /**
   * The offset relative to the start of the bufferView in bytes.
   */
  byteOffset?: number;
  /**
   * JSON object with extension-specific objects.
   */
  extensions?: Extension;
  /**
   * Application-specific data.
   */
  extras?: Extras;
};
