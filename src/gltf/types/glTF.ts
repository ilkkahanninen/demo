import { Accessor } from "./Accessor";
import { Animation } from "./Animation";
import { Buffer, BufferView } from "./Buffer";
import { Camera } from "./Camera";
import { Image } from "./Image";
import { Material } from "./Material";
import { Mesh } from "./Mesh";
import { Node } from "./Node";
import { Sampler } from "./Sampler";
import { Scene } from "./Scene";
import { Skin } from "./Skin";
import { Texture } from "./Texture";
import { Extension, Extras, NonEmptyArray } from "./common";

/**
 * The root object for a glTF asset.
 */
export type GLTF = {
  /**
   * Names of glTF extensions used in this asset.
   */
  extensionsUsed?: NonEmptyArray<string>;
  /**
   * Names of glTF extensions required to properly load this asset.
   */
  extensionsRequired?: NonEmptyArray<string>;
  /**
   * An array of accessors. An accessor is a typed view into a bufferView.
   */
  accessors?: NonEmptyArray<Accessor>;
  /**
   * An array of keyframe animations.
   */
  animations?: NonEmptyArray<Animation>;
  /**
   * Metadata about the glTF asset.
   */
  asset: Asset;
  /**
   * An array of buffers. A buffer points to binary geometry, animation, or skins.
   */
  buffers?: NonEmptyArray<Buffer>;
  /**
   * An array of bufferViews. A bufferView is a view into a buffer generally representing a subset of the buffer.
   */
  bufferViews?: NonEmptyArray<BufferView>;
  /**
   * An array of cameras. A camera defines a projection matrix.
   */
  cameras?: NonEmptyArray<Camera>;
  /**
   * An array of images. An image defines data used to create a texture.
   */
  images?: NonEmptyArray<Image>;
  /**
   * An array of materials. A material defines the appearance of a primitive.
   */
  materials?: NonEmptyArray<Material>;
  /**
   * An array of meshes. A mesh is a set of primitives to be rendered.
   */
  meshes?: NonEmptyArray<Mesh>;
  /**
   * An array of nodes.
   */
  nodes?: NonEmptyArray<Node>;
  /**
   * An array of samplers. A sampler contains properties for texture filtering and wrapping modes.
   */
  samplers?: NonEmptyArray<Sampler>;
  /**
   * The index of the default scene. This property MUST NOT be defined, when scenes is undefined.
   */
  scene?: number;
  /**
   * An array of scenes.
   */
  scenes?: NonEmptyArray<Scene>;
  /**
   * An array of skins. A skin is defined by joints and matrices.
   */
  skins?: NonEmptyArray<Skin>;
  /**
   * An array of textures.
   */
  textures?: NonEmptyArray<Texture>;
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
 * Metadata about the glTF asset.
 */
export type Asset = {
  /**
   * A copyright message suitable for display to credit the content creator.
   */
  copyright?: string;
  /**
   * Tool that generated this glTF model. Useful for debugging.
   */
  generator?: string;
  /**
   * The glTF version in the form of <major>.<minor> that this asset targets.
   */
  version: Version;
  /**
   * The minimum glTF version in the form of <major>.<minor> that this asset targets.
   * This property MUST NOT be greater than the asset version.
   */
  minVersion?: Version;
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
 * The glTF version in the form of <major>.<minor>.
 */
export type Version = `${number}.${number}`;
