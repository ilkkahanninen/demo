import { Extension, Extras } from "./common";

/**
 * Image data used to create a texture. Image MAY be referenced by an URI (or IRI) or a buffer view index.
 */
export type Image = URIImage | BufferImage;

/**
 * Image data used to create a texture. Image is referenced by an URI (or IRI).
 */
export type URIImage = {
  /**
   * The URI (or IRI) of the image. Relative paths are relative to the current glTF asset.
   * Instead of referencing an external file, this field MAY contain a data:-URI.
   */
  uri: string;
  /**
   * The image’s media type.
   */
  mimeType?: string;
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
 * Image data used to create a texture. Image is be referenced by a buffer view index.
 */
export type BufferImage = {
  /**
   * The image’s media type.
   */
  mimeType: string;
  /**
   * The index of the bufferView that contains the image.
   */
  bufferView: number;
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

export const isURIImage = (image: Image): image is URIImage =>
  (image as URIImage).uri !== undefined;

export const isBufferImage = (image: Image): image is BufferImage =>
  (image as BufferImage).bufferView !== undefined;
