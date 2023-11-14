import {
  ARRAY_BUFFER,
  ELEMENT_ARRAY_BUFFER,
  Extension,
  Extras,
} from "./common";

/**
 * A buffer points to binary geometry, animation, or skins.
 */
export type Buffer = {
  /**
   * The URI (or IRI) of the buffer. Relative paths are relative to the current glTF asset.
   * Instead of referencing an external file, this field MAY contain a data:-URI.
   */
  uri?: string;
  /**
   * The length of the buffer in bytes.
   */
  byteLength: number;
  /**
   * The user-defined name of this object. This is not necessarily unique, e.g., an accessor and a buffer
   * could have the same name, or two accessors could even have the same name.
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
 * A view into a buffer generally representing a subset of the buffer.
 */
export type BufferView = {
  /**
   * The index of the buffer.
   */
  buffer: number;
  /**
   * The offset into the buffer in bytes.
   */
  byteOffset?: number;
  /**
   * The length of the bufferView in bytes.
   */
  byteLength: number;
  /**
   * The stride, in bytes, between vertex attributes. When this is not defined, data is tightly packed.
   * When two or more accessors use the same buffer view, this field MUST be defined.
   */
  byteStride?: number;
  /**
   * The hint representing the intended GPU buffer type to use with this buffer view.
   */
  target?: ARRAY_BUFFER | ELEMENT_ARRAY_BUFFER;
  /**
   * The user-defined name of this object. This is not necessarily unique, e.g., an accessor and a buffer
   * could have the same name, or two accessors could even have the same name.
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
