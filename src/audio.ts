export const loadAudio = (): Promise<HTMLAudioElement> =>
  new Promise((resolve, reject) => {
    const url = new URL("muntele.mp3", import.meta.url);
    const audio = new Audio(url.href);
    audio.oncanplay = () => resolve(audio);
    audio.onerror = reject;
  });
