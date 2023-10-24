const BITRATE = 60;

export const fft = (data: number[]) => {
  const duration = data.length / BITRATE;
  return {
    duration,
    get: (time: number) => (data[Math.floor(time * BITRATE)] || 0) / 255,
  };
};
