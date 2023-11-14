import { Extension, Extras } from "./common";

/**
 * A camera’s projection. A node MAY reference a camera to apply a transform to place the camera in the scene.
 */
export type Camera = OrtographicCamera | PerspectiveCamera;

export type OrtographicCamera = {
  orthographic: CameraOrtographic;
  /**
   * Specifies if the camera uses a perspective or orthographic projection.
   */
  type: "orthographic";
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

export type CameraOrtographic = {
  /**
   * The floating-point horizontal magnification of the view. This value MUST NOT be equal to zero. This value SHOULD NOT be negative.
   */
  xmag: number;
  /**
   * The floating-point vertical magnification of the view. This value MUST NOT be equal to zero. This value SHOULD NOT be negative.
   */
  ymag: number;
  /**
   * The floating-point distance to the far clipping plane. This value MUST NOT be equal to zero. zfar MUST be greater than znear.
   */
  zfar: number;
  /**
   * The floating-point distance to the near clipping plane.
   */
  znear: number;
  /**
   * JSON object with extension-specific objects.
   */
  extensions?: Extension;
  /**
   * Application-specific data.
   */
  extras?: Extras;
};

export type PerspectiveCamera = {
  orthographic: CameraPerspective;
  /**
   * Specifies if the camera uses a perspective or orthographic projection.
   */
  type: "perspective";
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

export type CameraPerspective = {
  /**
   * The floating-point aspect ratio of the field of view. When undefined, the aspect ratio of the rendering viewport MUST be used.
   */
  aspectRatio?: number;
  /**
   * The floating-point vertical field of view in radians. This value SHOULD be less than π.
   */
  yfov: number;
  /**
   * The floating-point distance to the far clipping plane. When defined, zfar MUST be greater than znear.
   * If zfar is undefined, client implementations SHOULD use infinite projection matrix.
   */
  zfar?: number;
  /**
   * The floating-point distance to the near clipping plane.
   */
  znear: number;
  /**
   * JSON object with extension-specific objects.
   */
  extensions?: Extension;
  /**
   * Application-specific data.
   */
  extras?: Extras;
};
