export type Segment<T> = (duration: number) => BoundSegment<T>;

export type BoundSegment<T> = {
  get: (relativeTime: number) => T;
  duration: number;
};

export const beatCalculator =
  (bpm: number) =>
  (count: number): number =>
    (count * 60.0) / bpm;

export const barCalculator = (bpm: number, barLength: number) => {
  const calc = beatCalculator(bpm / barLength);
  return (count: number) => calc(count);
};

export const expr =
  <T>(get: (time: number) => T): Segment<T> =>
  (duration) => ({ get, duration });

export const hold = (value: number): Segment<number> => expr(() => value);

export const linear =
  (from: number, to: number): Segment<number> =>
  (duration) => {
    const coef = (to - from) / duration;
    return {
      get: (time) => from + Math.min(time, duration) * coef,
      duration,
    };
  };

export const join = <T>(...segments: BoundSegment<T>[]): BoundSegment<T> => {
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

export const repeat = <T>(
  times: number,
  segment: BoundSegment<T>
): BoundSegment<T> => {
  const duration = times * segment.duration;
  return {
    get: (time) => segment.get(Math.min(time, duration) % segment.duration),
    duration,
  };
};

export const labels = <T extends object>(obj: {
  [K in keyof T]: BoundSegment<T[K]>;
}): BoundSegment<T> => {
  const duration = Object.values<BoundSegment<any>>(obj).reduce(
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

export const vector =
  <T>(...arr: Segment<T>[]) =>
  (duration: number): BoundSegment<T[]> => {
    const segments = arr.map((a) => a(duration));
    return {
      get: (time: number) => segments.map((seg) => seg.get(time)),
      duration,
    };
  };

export const sin = (
  amplitude: number,
  hz: number,
  phase: number = 0
): Segment<number> => {
  const coef = Math.PI * 2 * hz;
  return expr((t) => amplitude * Math.sin(t * coef + phase));
};

export const cos = (
  amplitude: number,
  hz: number,
  phase: number = 0
): Segment<number> => {
  const coef = Math.PI * 2 * hz;
  return expr((t) => amplitude * Math.cos(t * coef + phase));
};

export const map =
  <T>(f: (a: T) => T) =>
  (seg: Segment<T>): Segment<T> =>
  (duration) => {
    const bound = seg(duration);
    return {
      get: (time) => f(bound.get(time)),
      duration,
    };
  };

export const add = (n: number) => map((a: number) => a + n);
