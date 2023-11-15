export type Extensions = {};

export type ExtendableObject = {
  extension?: Partial<Extensions>;
};

export const supportedExtensions: string[] = [];
