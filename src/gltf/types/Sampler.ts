import {
  CLAMP_TO_EDGE,
  Extension,
  Extras,
  LINEAR,
  LINEAR_MIPMAP_LINEAR,
  LINEAR_MIPMAP_NEAREST,
  MIRRORED_REPEAT,
  NEAREST,
  NEAREST_MIPMAP_LINEAR,
  NEAREST_MIPMAP_NEAREST,
  REPEAT,
} from "./common";

/**
 * Texture sampler properties for filtering and wrapping modes.
 */
export type Sampler = {
  /**
   * Magnification filter.
   */
  magFilter?: NEAREST | LINEAR;
  /**
   * Minification filter.
   */
  minFilter?:
    | NEAREST
    | LINEAR
    | NEAREST_MIPMAP_NEAREST
    | LINEAR_MIPMAP_NEAREST
    | NEAREST_MIPMAP_LINEAR
    | LINEAR_MIPMAP_LINEAR;
  /**
   * S (U) wrapping mode.
   */
  wrapS?: CLAMP_TO_EDGE | MIRRORED_REPEAT | REPEAT;
  /**
   * T (V) wrapping mode.
   */
  wrapT?: CLAMP_TO_EDGE | MIRRORED_REPEAT | REPEAT;
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
