import { Music } from "./audio";

export class Clock {
  bpm: number;
  startTime = 0;
  pauseTime: number | null = null;
  pendingRender: (() => void) | null = null;
  music: HTMLAudioElement | null;
  capture: boolean;
  captureFrame: number = 0;

  constructor(beatsPerMinute: number, music: Music) {
    this.bpm = beatsPerMinute;
    this.capture = window.location.search.includes("capture");
    this.music = !this.capture && music.audio ? music.audio : null;

    window.addEventListener("keydown", (event) => {
      // console.log("down", event.code);
      switch (event.code) {
        case "Space":
          return this.pauseTime ? this.resume() : this.pause();
        case "ArrowRight":
          const blockLength = 32 * 60 / this.bpm
          const currentBlock = this.seconds() / blockLength
          const blockLeft = 1 - (currentBlock - Math.abs(currentBlock))
          return this.forward(blockLeft * blockLength * 1000);
        case "ArrowLeft":
          return this.rewind(10000);
      }
    });
  }

  reset(): void {
    this.pauseTime = null;
    this.startTime = new Date().getTime();
    if (this.music) {
      this.music.currentTime = 0;
      this.music.play();
    }
  }

  pause(): void {
    if (!this.pauseTime) {
      this.pauseTime = new Date().getTime();
      this.music?.pause();
    }
  }

  resume(): void {
    if (this.pauseTime) {
      this.startTime += new Date().getTime() - this.pauseTime;
      this.pauseTime = null;
      this.pendingRender && requestAnimationFrame(this.pendingRender);
      this.music?.play();
    }
  }

  forward(milliseconds: number) {
    this.startTime -= milliseconds;
    if (this.music) {
      this.music.currentTime = this.seconds();
    }
  }

  rewind(milliseconds: number) {
    this.startTime += milliseconds;
    if (this.music) {
      this.music.currentTime = this.seconds();
    }
  }

  seconds(): number {
    if (this.capture) {
      return this.captureFrame / 60;
    }
    return ((this.pauseTime || new Date().getTime()) - this.startTime) * 0.001;
  }

  beats(): number {
    return (this.seconds() * 60.0) / this.bpm;
  }

  async requestNextFrame(render: () => void) {
    if (this.capture) {
      document.title = this.captureFrame.toString();
      this.pendingRender = render;
      this.pause();
      this.captureFrame++;
    } else if (this.pauseTime) {
      this.pendingRender = render;
    } else {
      requestAnimationFrame(render);
    }
  }
}
