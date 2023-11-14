export type BYTE = WebGL2RenderingContext["BYTE"];
export type UNSIGNED_BYTE = WebGL2RenderingContext["UNSIGNED_BYTE"];
export type SHORT = WebGL2RenderingContext["SHORT"];
export type UNSIGNED_SHORT = WebGL2RenderingContext["UNSIGNED_SHORT"];
export type UNSIGNED_INT = WebGL2RenderingContext["UNSIGNED_INT"];
export type FLOAT = WebGL2RenderingContext["FLOAT"];

export type ARRAY_BUFFER = WebGL2RenderingContext["ARRAY_BUFFER"];
export type ELEMENT_ARRAY_BUFFER =
  WebGL2RenderingContext["ELEMENT_ARRAY_BUFFER"];

export type POINTS = WebGL2RenderingContext["POINTS"];
export type LINES = WebGL2RenderingContext["LINES"];
export type LINE_LOOP = WebGL2RenderingContext["LINE_LOOP"];
export type LINE_STRIP = WebGL2RenderingContext["LINE_STRIP"];
export type TRIANGLES = WebGL2RenderingContext["TRIANGLES"];
export type TRIANGLE_STRIP = WebGL2RenderingContext["TRIANGLE_STRIP"];
export type TRIANGLE_FAN = WebGL2RenderingContext["TRIANGLE_FAN"];

export type NEAREST = WebGL2RenderingContext["NEAREST"];
export type LINEAR = WebGL2RenderingContext["LINEAR"];
export type NEAREST_MIPMAP_NEAREST =
  WebGL2RenderingContext["NEAREST_MIPMAP_NEAREST"];
export type LINEAR_MIPMAP_NEAREST =
  WebGL2RenderingContext["LINEAR_MIPMAP_NEAREST"];
export type NEAREST_MIPMAP_LINEAR =
  WebGL2RenderingContext["NEAREST_MIPMAP_LINEAR"];
export type LINEAR_MIPMAP_LINEAR =
  WebGL2RenderingContext["LINEAR_MIPMAP_LINEAR"];

export type CLAMP_TO_EDGE = WebGL2RenderingContext["CLAMP_TO_EDGE"];
export type MIRRORED_REPEAT = WebGL2RenderingContext["MIRRORED_REPEAT"];
export type REPEAT = WebGL2RenderingContext["REPEAT"];

export type Extension = object;

export type Extras = any;

export type NonEmptyArray<T> = Array<T> & { 0: T };

export type ArrayLengthMutationKeys =
  | "splice"
  | "push"
  | "pop"
  | "shift"
  | "unshift";
export type FixedLengthArray<
  T,
  L extends number,
  TObj = [T, ...Array<T>]
> = Pick<TObj, Exclude<keyof TObj, ArrayLengthMutationKeys>> & {
  readonly length: L;
  [I: number]: T;
  [Symbol.iterator]: () => IterableIterator<T>;
};
