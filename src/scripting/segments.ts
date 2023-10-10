export type SegmentCtor<T> = (duration: number) => Segment<T>;

export type Segment<T> = {
  get: (time: number) => T;
  duration: number;
};

export const expr =
  <T>(get: (time: number) => T): SegmentCtor<T> =>
  (duration) => ({ get, duration });

export const hold = (value: number): SegmentCtor<number> => expr(() => value);

export const linear =
  (from: number, to: number): SegmentCtor<number> =>
  (duration) => {
    const coef = (to - from) / duration;
    return {
      get: (time) => from + Math.min(time, duration) * coef,
      duration,
    };
  };

export const sin = (
  amplitude: number,
  hz: number,
  phase: number = 0
): SegmentCtor<number> => {
  const coef = Math.PI * 2 * hz;
  return expr((t) => amplitude * Math.sin(t * coef + phase));
};

export const cos = (
  amplitude: number,
  hz: number,
  phase: number = 0
): SegmentCtor<number> => {
  const coef = Math.PI * 2 * hz;
  return expr((t) => amplitude * Math.cos(t * coef + phase));
};
