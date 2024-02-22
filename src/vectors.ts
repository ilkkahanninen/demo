import { NonEmptyArray } from "./gltf/types/common";

export type Vec = Vec2 | Vec3 | Vec4;

export type Vec2 = [number, number];
export type Vec3 = [number, number, number];
export type Vec4 = [number, number, number, number];
export type Mat4x4 = [
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number
];

export const vec2 = (x: number, y: number): Vec2 => [x, y];
export const vec3 = (x: number, y: number, z: number): Vec3 => [x, y, z];
export const vec4 = (x: number, y: number, z: number, w: number): Vec4 => [
  x,
  y,
  z,
  w,
];

export const length = (v: Vec): number =>
  Math.sqrt(v.map((a) => a * a).reduce((a, b) => a + b));

export const multiply = <T extends Vec>(v: T, coef: number): T =>
  v.map((a) => a * coef) as T;

export const normalize = <T extends Vec>(v: T): T => multiply(v, 1 / length(v));

export const identityMatrix: Mat4x4 = [
  1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1,
];

// prettier-ignore
export const scaleMatrix = ([w, h, d]: Vec3): Mat4x4 => [
  w, 0, 0, 0,
  0, h, 0, 0,
  0, 0, d, 0,
  0, 0, 0, 1,
];

// prettier-ignore
export const translationMatrix = ([x, y, z]: Vec3): Mat4x4 => [
  1, 0, 0, 0,
  0, 1, 0, 0,
  0, 0, 1, 0,
  x, y, z, 1,
];

export const rotationMatrix = ([q0, q1, q2, q3]: Vec4): Mat4x4 => {
  // First row of the rotation matrix
  const r00 = 2 * (q0 * q0 + q1 * q1) - 1;
  const r01 = 2 * (q1 * q2 - q0 * q3);
  const r02 = 2 * (q1 * q3 + q0 * q2);

  // Second row of the rotation matrix
  const r10 = 2 * (q1 * q2 + q0 * q3);
  const r11 = 2 * (q0 * q0 + q2 * q2) - 1;
  const r12 = 2 * (q2 * q3 - q0 * q1);

  // Third row of the rotation matrix
  const r20 = 2 * (q1 * q3 - q0 * q2);
  const r21 = 2 * (q2 * q3 + q0 * q1);
  const r22 = 2 * (q0 * q0 + q3 * q3) - 1;

  // prettier-ignore
  return [
    r00, r10, r20, 0,
    r01, r11, r21, 0,
    r02, r12, r22, 0,
    0,   0,   0,   1
  ];
};

export const multiplyMatrixAndVec4 = (matrix: Mat4x4, point: Vec4) => {
  // Give a simple variable name to each part of the matrix, a column and row number
  const c0r0 = matrix[0],
    c1r0 = matrix[1],
    c2r0 = matrix[2],
    c3r0 = matrix[3];
  const c0r1 = matrix[4],
    c1r1 = matrix[5],
    c2r1 = matrix[6],
    c3r1 = matrix[7];
  const c0r2 = matrix[8],
    c1r2 = matrix[9],
    c2r2 = matrix[10],
    c3r2 = matrix[11];
  const c0r3 = matrix[12],
    c1r3 = matrix[13],
    c2r3 = matrix[14],
    c3r3 = matrix[15];

  // Now set some simple names for the point
  const x = point[0];
  const y = point[1];
  const z = point[2];
  const w = point[3];

  // Multiply the point against each part of the 1st column, then add together
  const resultX = x * c0r0 + y * c0r1 + z * c0r2 + w * c0r3;

  // Multiply the point against each part of the 2nd column, then add together
  const resultY = x * c1r0 + y * c1r1 + z * c1r2 + w * c1r3;

  // Multiply the point against each part of the 3rd column, then add together
  const resultZ = x * c2r0 + y * c2r1 + z * c2r2 + w * c2r3;

  // Multiply the point against each part of the 4th column, then add together
  const resultW = x * c3r0 + y * c3r1 + z * c3r2 + w * c3r3;

  return [resultX, resultY, resultZ, resultW];
};

export const matrixProduct = (matrixA: Mat4x4, matrixB: Mat4x4): Mat4x4 => {
  // Slice the second matrix up into rows
  const row0: Vec4 = [matrixB[0], matrixB[1], matrixB[2], matrixB[3]];
  const row1: Vec4 = [matrixB[4], matrixB[5], matrixB[6], matrixB[7]];
  const row2: Vec4 = [matrixB[8], matrixB[9], matrixB[10], matrixB[11]];
  const row3: Vec4 = [matrixB[12], matrixB[13], matrixB[14], matrixB[15]];

  // Multiply each row by matrixA
  const result0 = multiplyMatrixAndVec4(matrixA, row0);
  const result1 = multiplyMatrixAndVec4(matrixA, row1);
  const result2 = multiplyMatrixAndVec4(matrixA, row2);
  const result3 = multiplyMatrixAndVec4(matrixA, row3);

  // Turn the result rows back into a single matrix
  return [
    result0[0],
    result0[1],
    result0[2],
    result0[3],
    result1[0],
    result1[1],
    result1[2],
    result1[3],
    result2[0],
    result2[1],
    result2[2],
    result2[3],
    result3[0],
    result3[1],
    result3[2],
    result3[3],
  ];
};

export const multiplyMatrices = (...matrices: NonEmptyArray<Mat4x4>): Mat4x4 =>
  matrices.reduce(matrixProduct);
