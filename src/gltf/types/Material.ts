import { TextureInfo } from "./Texture";
import { Extension, Extras, FixedLengthArray } from "./common";

export type Material = {
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
  /**
   * A set of parameter values that are used to define the metallic-roughness material model from Physically Based Rendering (PBR)
   * methodology. When undefined, all the default values of pbrMetallicRoughness MUST apply.
   */
  pbrMetallicRoughness?: PbrMetallicRoughness;
  /**
   * The tangent space normal texture. The texture encodes RGB components with linear transfer function.
   * Each texel represents the XYZ components of a normal vector in tangent space. The normal vectors use
   * the convention +X is right and +Y is up. +Z points toward the viewer.
   *
   * If a fourth component (A) is present, it MUST be ignored. When undefined, the material does not have a tangent
   * space normal texture.
   */
  normalTexture?: NormalTextureInfo;
  /**
   * The occlusion texture. The occlusion values are linearly sampled from the R channel. Higher values indicate areas that
   * receive full indirect lighting and lower values indicate no indirect lighting. If other channels are present (GBA),
   * they MUST be ignored for occlusion calculations. When undefined, the material does not have an occlusion texture.
   */
  occlusionTexture?: OcclusionTextureInfo;
  /**
   * The emissive texture. It controls the color and intensity of the light being emitted by the material.
   * This texture contains RGB components encoded with the sRGB transfer function.
   *
   * If a fourth component (A) is present, it MUST be ignored. When undefined, the texture MUST be sampled
   * as having 1.0 in RGB components.
   */
  emissiveTexture?: TextureInfo;
  /**
   * The factors for the emissive color of the material. This value defines linear multipliers for the sampled
   * texels of the emissive texture.
   */
  emissiveFactor?: FixedLengthArray<number, 3>;
  /**
   * The material’s alpha rendering mode enumeration specifying the interpretation of the alpha value of the base color.
   * Default is "OPAQUE"
   */
  alphaMode?: AlphaMode;
  /**
   * Specifies the cutoff threshold when in MASK alpha mode. If the alpha value is greater than or equal to this value
   * then it is rendered as fully opaque, otherwise, it is rendered as fully transparent. A value greater than 1.0 will
   * render the entire material as fully transparent. This value MUST be ignored for other alpha modes. When alphaMode
   * is not defined, this value MUST NOT be defined.
   */
  alphaCutoff?: number;
  /**
   * Specifies whether the material is double sided. When this value is false, back-face culling is enabled.
   * When this value is true, back-face culling is disabled and double-sided lighting is enabled.
   * The back-face MUST have its normals reversed before the lighting equation is evaluated.
   */
  doubleSided?: boolean;
};

/**
 * The material’s alpha rendering mode enumeration specifying the interpretation of the alpha value of the base color.
 */
export type AlphaMode = AlphaModeOpaque | AlphaModeMask | AlphaModeBlend;

/**
 * The alpha value is ignored, and the rendered output is fully opaque.
 */
export type AlphaModeOpaque = "OPAQUE";

/**
 * The rendered output is either fully opaque or fully transparent depending on the alpha value and the specified
 * alphaCutoff value; the exact appearance of the edges MAY be subject to implementation-specific techniques such
 * as “Alpha-to-Coverage”.
 */
export type AlphaModeMask = "MASK";

/**
 * he alpha value is used to composite the source and destination areas. The rendered output is combined with
 * the background using the normal painting operation (i.e. the Porter and Duff over operator).
 */
export type AlphaModeBlend = "BLEND";

/**
 * A set of parameter values that are used to define the metallic-roughness material model from
 * Physically-Based Rendering (PBR) methodology.
 */
export type PbrMetallicRoughness = {
  /**
   * The factors for the base color of the material. This value defines linear multipliers for the sampled
   * texels of the base color texture.
   */
  baseColorFactor?: FixedLengthArray<number, 4>;
  /**
   * The base color texture. The first three components (RGB) MUST be encoded with the sRGB transfer function.
   * They specify the base color of the material. If the fourth component (A) is present, it represents the
   * linear alpha coverage of the material. Otherwise, the alpha coverage is equal to 1.0.
   * The material.alphaMode property specifies how alpha is interpreted. The stored texels MUST NOT be premultiplied.
   * When undefined, the texture MUST be sampled as having 1.0 in all components.
   */
  baseColorTexture?: TextureInfo;
  /**
   * The factor for the metalness of the material. This value defines a linear multiplier for the sampled metalness
   * values of the metallic-roughness texture.
   */
  metallicFactor?: number;
  /**
   * The factor for the roughness of the material. This value defines a linear multiplier for the sampled roughness
   * values of the metallic-roughness texture.
   */
  roughnessFactor?: number;
  /**
   * The metallic-roughness texture. The metalness values are sampled from the B channel.
   * The roughness values are sampled from the G channel. These values MUST be encoded with a linear transfer function.
   * If other channels are present (R or A), they MUST be ignored for metallic-roughness calculations.
   * When undefined, the texture MUST be sampled as having 1.0 in G and B components.
   */
  metallicRoughnessTexture?: TextureInfo;
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
 * Reference to a normal texture.
 */
export type NormalTextureInfo = {
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
   * The scalar parameter applied to each normal vector of the texture. This value scales the normal vector in X and Y
   * directions using the formula:
   *
   *    scaledNormal = normalize<sampled normal texture value> * 2.0 - 1.0) * vec3(<normal scale>, <normal scale>, 1.0.
   */
  scale: number;
  /**
   * JSON object with extension-specific objects.
   */
  extensions?: Extension;
  /**
   * Application-specific data.
   */
  extras?: Extras;
};

export type OcclusionTextureInfo = {
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
   * A scalar parameter controlling the amount of occlusion applied. A value of 0.0 means no occlusion.
   * A value of 1.0 means full occlusion. This value affects the final occlusion value as:
   *
   *    1.0 + strength * (<sampled occlusion texture value> - 1.0).
   */
  strength: number;
  /**
   * JSON object with extension-specific objects.
   */
  extensions?: Extension;
  /**
   * Application-specific data.
   */
  extras?: Extras;
};
