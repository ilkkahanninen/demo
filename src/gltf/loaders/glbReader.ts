import { GLTF } from "../types/glTF";

type GlbFile = {
  glbVersion: number;
  json: GLTF;
  bin?: Uint8Array;
};

type Header = {
  version: number;
  length: number;
};

type Chunk = JSONChunk | BinaryBufferChunk | ExtensionChunk;

type JSONChunk = {
  type: "json";
  json: GLTF;
  nextOffset: number;
};

type BinaryBufferChunk = {
  type: "binary";
  buffer: Uint8Array;
  nextOffset: number;
};

type ExtensionChunk = {
  type: "extension";
  subtype: string;
  data: Uint8Array;
  nextOffset: number;
};

const FILE_HEADER_LENGTH = 12;
const CHUNK_HEADER_LENGTH = 8;

export const fetchGlbFile = async (url: URL): Promise<GlbFile> => {
  const response = await fetch(url);
  const blob = await response.blob();
  const data = await blob.arrayBuffer();
  return readGlbData(data);
};

export const readGlbData = (data: ArrayBuffer): GlbFile => {
  const header = readHeader(data);

  const json = readChunk(data);
  if (json?.type !== "json") {
    throw new Error(
      `First chunk has wrong type: ${json?.type || "data missing"}`
    );
  }

  const buffer = readChunk(data, json.nextOffset);
  if (buffer && buffer.type !== "binary") {
    throw new Error(`Second chunk has wrong type: ${buffer.type}`);
  }

  // Reading extension chunks will be implemented later if there is need

  return {
    glbVersion: header.version,
    json: json.json,
    bin: buffer?.buffer,
  };
};

const readHeader = (data: ArrayBuffer): Header => {
  const [magic, version, length] = new Uint32Array(data, 0, FILE_HEADER_LENGTH);
  if (magic != 0x46546c67) {
    throw new Error("Not an binary glTF file");
  }
  if (version != 2) {
    throw new Error(`Invalid GLB container version: ${version}`);
  }
  return { version, length };
};

const readChunk = (
  data: ArrayBuffer,
  byteOffset: number = FILE_HEADER_LENGTH
): Chunk | undefined => {
  const [length, type] = new Uint32Array(data, byteOffset, CHUNK_HEADER_LENGTH);
  const typeAscii = new TextDecoder().decode(new Uint32Array([type]));
  const nextOffset = byteOffset + CHUNK_HEADER_LENGTH + length;

  if (length === 0) {
    return undefined;
  }

  if (typeAscii === "JSON") {
    const chunkData = new Uint8Array(data, byteOffset + 8, length);
    return {
      type: "json",
      json: JSON.parse(new TextDecoder().decode(chunkData)),
      nextOffset,
    };
  }
  if (typeAscii === "BIN\0") {
    const chunkData = new Uint8Array(data, byteOffset + 8, length);
    return {
      type: "binary",
      buffer: chunkData,
      nextOffset,
    };
  }
  return {
    type: "extension",
    subtype: typeAscii,
    data: new Uint8Array(0),
    nextOffset,
  };
};

class Offset {
  bytes: number = 0;

  forward(bytes: number) {
    this.bytes += Math.ceil(bytes / 4) * 4;
  }
}
