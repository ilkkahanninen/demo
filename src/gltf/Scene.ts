import { Node } from "./Node";
import { Extension, Extras, NonEmptyArray } from "./common";

/**
 * The root nodes of a scene.
 */
export type Scene = {
  /**
   * The indices of each root node.
   */
  nodes?: NonEmptyArray<Node>;
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
