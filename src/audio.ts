import { Resource, ResourcePromise } from "./Resource";

export class Music extends Resource {
  audio: HTMLAudioElement | null = null;

  constructor(url: URL) {
    const audio = new ResourcePromise<HTMLAudioElement>((resolve, reject) => {
      const audio = new Audio(url.href);
      audio.oncanplay = () => resolve(audio);
      audio.onerror = reject;
      resolve(audio);
    });

    super(audio);

    audio.promise.then((audio) => {
      this.audio = audio;
    });
  }
}
