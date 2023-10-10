export const beatCalculator =
  (bpm: number) =>
  (count: number): number =>
    (count * 60.0) / bpm;

export const barCalculator = (bpm: number, barLength: number) => {
  const calc = beatCalculator(bpm / barLength);
  return (count: number) => calc(count);
};
