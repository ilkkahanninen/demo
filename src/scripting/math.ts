import { map } from "./modifiers";

export const floor = map<number>((n) => Math.floor(n));
