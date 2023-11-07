import { Segment, SegmentCtor } from "./segments";
import { sum } from "./utils";

export const concat = <T>(...segments: Segment<T>[]): Segment<T> => {
  const lastSegment = segments[segments.length - 1];
  const duration = segments.reduce((acc, s) => acc + s.duration, 0);
  return {
    get(time) {
      let acc = 0;
      for (let segment of segments) {
        if (time < acc + segment.duration) {
          return segment.get(time - acc);
        }
        acc += segment.duration;
      }
      return lastSegment.get(time);
    },
    duration,
  };
};

export const repeat = <T>(times: number, segment: Segment<T>): Segment<T> => {
  const duration = times * segment.duration;
  return {
    get: (time) => segment.get(Math.min(time, duration) % segment.duration),
    duration,
  };
};

export const loop = <T>(
  times: number,
  getSegment: (index: number) => Segment<T>
): Segment<T> => ({
  get: (time) => {
    for (let i = 0; i < times; i++) {
      const segment = getSegment(i);
      if (time < segment.duration) {
        return segment.get(time);
      }
      time -= segment.duration;
    }
    return getSegment(times - 1).get(time);
  },
  duration: sum(new Array(times).fill(0).map((_, i) => getSegment(i).duration)),
});

export const assign =
  <T extends object>(obj: {
    [K in keyof T]: SegmentCtor<T[K]>;
  }): SegmentCtor<T> =>
  (duration) => {
    const segments = Object.fromEntries(
      Object.entries(obj).map(([key, ctor]) => [
        key,
        (ctor as SegmentCtor<T>)(duration),
      ])
    );
    return assignSegments(segments) as Segment<T>;
  };

export const assignSegments = <T extends object>(obj: {
  [K in keyof T]: Segment<T[K]>;
}): Segment<T> => {
  const duration = Object.values<Segment<any>>(obj).reduce(
    (acc, seg) => Math.max(acc, seg.duration),
    0
  );
  return {
    get: (time: number) =>
      Object.fromEntries(
        Object.entries(obj).map(([key, seg]) => [key, (seg as any).get(time)])
      ) as T,
    duration,
  };
};

export const mergeSegments = <T extends object, S extends object>(
  a: Segment<T>,
  b: Segment<S>
): Segment<T & S> => ({
  duration: Math.max(a.duration, b.duration),
  get: (time) => ({ ...a.get(time), ...b.get(time) }),
});

export const vector =
  <T>(...constructors: SegmentCtor<T>[]) =>
  (duration: number): Segment<T[]> => {
    const segments = constructors.map((a) => a(duration));
    return {
      get: (time: number) => segments.map((seg) => seg.get(time)),
      duration,
    };
  };

export const split =
  <T>(...constructors: SegmentCtor<T>[]): SegmentCtor<T> =>
  (duration) =>
    concat(...constructors.map((ctor) => ctor(duration / constructors.length)));

export const flex =
  <T>(...parts: Array<[number, SegmentCtor<T>]>): SegmentCtor<T> =>
  (duration) => {
    const totalLength = parts.reduce((acc, part) => acc + part[0], 0);
    return concat(
      ...parts.map((part) => part[1]((part[0] / totalLength) * duration))
    );
  };
