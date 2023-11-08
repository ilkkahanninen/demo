import { map } from "./modifiers";
import { Segment } from "./segments";

export const floor = map<number>((n) => Math.floor(n));

export const multiplySegments = (
  a: Segment<number>,
  b: Segment<number>
): Segment<number> => ({
  duration: Math.max(a.duration, b.duration),
  get: (time: number) => a.get(time) * b.get(time),
});
