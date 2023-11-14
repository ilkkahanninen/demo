import { Extension, Extras } from "./common";

/**
 * A texture and its sampler.
 */
export type Texture = {
  /**
   * The index of the sampler used by this texture. When undefined, a sampler with repeat wrapping and auto filtering SHOULD be used.
   */
  sampler?: number;
  /**
   * The index of the image used by this texture. When undefined, an extension or other mechanism SHOULD supply an alternate
   * texture source, otherwise behavior is undefined.
   */
  source?: number;
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
 * Reference to a texture.
 */
export type TextureInfo = {
  /**
   * The index of the texture.
   */
  index: number;
  /**
   * This integer value is used to construct a string in the format TEXCOORD_<set index> which is a reference to
   * a key in mesh.primitives.attributes (e.g. a value of 0 corresponds to TEXCOORD_0).
   * A mesh primitive MUST have the corresponding texture coordinate attributes for the material to be applicable to it.
   */
  texCoord?: number;
  /**
   * JSON object with extension-specific objects.
   */
  extensions?: Extension;
  /**
   * Application-specific data.
   */
  extras?: Extras;
};
