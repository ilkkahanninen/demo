export class Clock {
  bpm: number;
  startTime = 0;

  constructor(beatsPerMinute: number) {
    this.bpm = beatsPerMinute;
  }

  reset(): void {
    this.startTime = this.now();
  }

  seconds(): number {
    return (this.now() - this.startTime) * 0.0001;
  }

  beats(): number {
    return (this.seconds() * 60.0) / this.bpm;
  }

  private now(): number {
    return new Date().getTime();
  }
}
