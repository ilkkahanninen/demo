export type Segment = (duration: number) => BoundSegment;

export type BoundSegment = {
  get: (relativeTime: number) => number;
  duration: number;
};

export const hold =
  (value: number): Segment =>
  (duration) => ({
    get: () => value,
    duration,
  });

export const linear =
  (from: number, to: number): Segment =>
  (duration) => {
    const coef = (to - from) / duration;
    return {
      get: (time) => from + Math.min(time, duration) * coef,
      duration,
    };
  };

export const join = (...segments: BoundSegment[]): BoundSegment => {
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
      return lastSegment.get(time - duration);
    },
    duration,
  };
};
