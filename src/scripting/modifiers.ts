import { Segment, SegmentCtor } from "./segments";

export const map =
  <T>(f: (a: T) => T) =>
  (seg: SegmentCtor<T>): SegmentCtor<T> =>
  (duration) => {
    const bound = seg(duration);
    return {
      get: (time) => f(bound.get(time)),
      duration,
    };
  };

export const add = (n: number) => map((a: number) => a + n);

export const sampleAndHold = <T>(
  sampleLength: number,
  seg: Segment<T>
): Segment<T> => {
  return {
    get: (time) => seg.get(Math.floor(time / sampleLength) * sampleLength),
    duration: seg.duration,
  };
};

export const offset = <T>(timeOffset: number, seg: Segment<T>): Segment<T> => ({
  get: (time) => seg.get(time + timeOffset),
  duration: seg.duration,
});

export const resize = <T>(duration: number, seg: Segment<T>): Segment<T> => {
  const coef = duration / seg.duration;
  return {
    get: (time) => seg.get(coef * time),
    duration,
  };
};
