const BITRATE = 30;

export const fft = (data: number[]) => {
  const duration = data.length / BITRATE;
  return {
    duration,
    get: (time: number) => {
      const indexFloat = time * BITRATE;
      const indexInt = Math.floor(indexFloat);
      const v1 = data[indexInt] || 0;
      const v2 = data[indexInt + 1] || 0;
      const f = indexFloat - indexInt;
      return (v1 * (1 - f) + v2 * f) / 255;
    },
  };
};
