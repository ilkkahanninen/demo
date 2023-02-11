export class Clock {
  bpm: number;
  startTime = 0;
  pauseTime: number | null = null;
  pendingRender: (() => void) | null = null;

  constructor(beatsPerMinute: number) {
    this.bpm = beatsPerMinute;

    window.addEventListener("keydown", (event) => {
      console.log("down", event.code);
      switch (event.code) {
        case "Space":
          return this.pauseTime ? this.resume() : this.pause();
        case "ArrowRight":
          return this.forward(10);
        case "ArrowLeft":
          return this.rewind(10);
      }
    });
  }

  reset(): void {
    this.pauseTime = null;
    this.startTime = new Date().getTime();
  }

  pause(): void {
    if (!this.pauseTime) {
      this.pauseTime = new Date().getTime();
    }
  }

  resume(): void {
    if (this.pauseTime) {
      this.startTime += new Date().getTime() - this.pauseTime;
      this.pauseTime = null;
      this.pendingRender && this.requestNextFrame(this.pendingRender);
    }
  }

  forward(milliseconds: number) {
    this.startTime -= milliseconds;
  }

  rewind(milliseconds: number) {
    this.startTime += milliseconds;
  }

  seconds(): number {
    return ((this.pauseTime || new Date().getTime()) - this.startTime) * 0.0001;
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
