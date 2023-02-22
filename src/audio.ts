import { Resource } from "./Resource";

export class Music extends Resource {
  audio: HTMLAudioElement | null = null;

  constructor(url: URL) {
    const promise = new Promise<HTMLAudioElement>((resolve, reject) => {
      const audio = new Audio(url.href);
      audio.oncanplay = () => resolve(audio);
      audio.onerror = reject;
      resolve(audio);
    });

    super(promise);
    promise.then((audio) => {
      this.audio = audio;
    });
  }
}
