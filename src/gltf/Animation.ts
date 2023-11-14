import { Extension, Extras, NonEmptyArray } from "./common";

/**
 * A keyframe animation.
 */
export type Animation = {
  /**
   * An array of animation channels. An animation channel combines an animation sampler with a target property being animated.
   * Different channels of the same animation MUST NOT have the same targets.
   */
  channels: NonEmptyArray<AnimationChannel>;
  /**
   * An array of animation samplers. An animation sampler combines timestamps with a sequence of output values and defines
   * an interpolation algorithm.
   */
  samplers: NonEmptyArray<AnimationSampler>;
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
 * An animation channel combines an animation sampler with a target property being animated.
 */
export type AnimationChannel = {
  /**
   * The index of a sampler in this animation used to compute the value for the target,
   * e.g., a node’s translation, rotation, or scale (TRS).
   */
  sampler: number;
  /**
   * The descriptor of the animated property.
   */
  target: AnimationChannelTarget;
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
 * The descriptor of the animated property.
 */
export type AnimationChannelTarget = {
  /**
   * The index of the node to animate. When undefined, the animated object MAY be defined by an extension.
   */
  node?: number;
  /**
   * The name of the node’s TRS property to animate, or the "weights" of the Morph Targets it instantiates.
   * For the "translation" property, the values that are provided by the sampler are the translation along the X, Y, and Z axes.
   * For the "rotation" property, the values are a quaternion in the order (x, y, z, w), where w is the scalar.
   * For the "scale" property, the values are the scaling factors along the X, Y, and Z axes.
   */
  path: "translation" | "rotation" | "scale" | "weights";
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
 * An animation sampler combines timestamps with a sequence of output values and defines an interpolation algorithm.
 */
export type AnimationSampler = {
  /**
   * The index of an accessor containing keyframe timestamps. The accessor MUST be of scalar type with floating-point components.
   * The values represent time in seconds with time[0] >= 0.0, and strictly increasing values, i.e., time[n + 1] > time[n].
   */
  input: number;
  /**
   * Interpolation algorithm.
   *
   * - "LINEAR" The animated values are linearly interpolated between keyframes.
   *   When targeting a rotation, spherical linear interpolation (slerp) SHOULD be used to interpolate quaternions.
   *   The number of output elements MUST equal the number of input elements.
   *
   * - "STEP" The animated values remain constant to the output of the first keyframe, until the next keyframe.
   *   The number of output elements MUST equal the number of input elements.
   *
   * - "CUBICSPLINE" The animation’s interpolation is computed using a cubic spline with specified tangents.
   *    The number of output elements MUST equal three times the number of input elements. For each input element,
   *    the output stores three elements, an in-tangent, a spline vertex, and an out-tangent.
   *    There MUST be at least two keyframes when using this interpolation.
   */
  interpolation?: "LINEAR" | "STEP" | "CUBICSPLINE";
  /**
   * The index of an accessor, containing keyframe output values.
   */
  output: number;
  /**
   * JSON object with extension-specific objects.
   */
  extensions?: Extension;
  /**
   * Application-specific data.
   */
  extras?: Extras;
};
