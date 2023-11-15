import { readFileSync } from "fs";
import { fromGltfBinary } from "../src/gltf/index";

const file = readFileSync("test/Lantern.glb");

const arrayBuffer = new ArrayBuffer(file.length);
const view = new Uint8Array(arrayBuffer);
for (let i = 0; i < file.length; i++) {
  view[i] = file[i];
}

const asset = fromGltfBinary(arrayBuffer);
console.log(asset.json.bufferViews);
