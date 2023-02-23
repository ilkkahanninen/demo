import { Music } from "./audio";

export class Clock {
  bpm: number;
  startTime = 0;
  pauseTime: number | null = null;
  pendingRender: (() => void) | null = null;
  music: Music;

  constructor(beatsPerMinute: number, music: Music) {
    this.bpm = beatsPerMinute;
    this.music = music;

    window.addEventListener("keydown", (event) => {
      // console.log("down", event.code);
      switch (event.code) {
        case "Space":
          return this.pauseTime ? this.resume() : this.pause();
        case "ArrowRight":
          return this.forward(10000);
        case "ArrowLeft":
          return this.rewind(10000);
      }
    });
  }

  reset(): void {
    this.pauseTime = null;
    this.startTime = new Date().getTime();
    console.log(this.music.audio);
    if (this.music.audio) {
      this.music.audio.currentTime = 0;
      this.music.audio.play();
    }
  }

  pause(): void {
    if (!this.pauseTime) {
      this.pauseTime = new Date().getTime();
      this.music.audio?.pause();
    }
  }

  resume(): void {
    if (this.pauseTime) {
      this.startTime += new Date().getTime() - this.pauseTime;
      this.pauseTime = null;
      this.pendingRender && this.requestNextFrame(this.pendingRender);
      this.music.audio?.play();
    }
  }

  forward(milliseconds: number) {
    this.startTime -= milliseconds;
    if (this.music.audio) {
      this.music.audio.currentTime = this.seconds();
    }
  }

  rewind(milliseconds: number) {
    this.startTime += milliseconds;
    if (this.music.audio) {
      this.music.audio.currentTime = this.seconds();
    }
  }

  seconds(): number {
    return ((this.pauseTime || new Date().getTime()) - this.startTime) * 0.001;
  }

  beats(): number {
    return (this.seconds() * 60.0) / this.bpm;
  }

  async requestNextFrame(render: () => void) {
    if (this.pauseTime) {
      this.pendingRender = render;
    } else {
      requestAnimationFrame(render);
    }
  }
}
