export class CallThrottler {
  constructor (delay) {
    this.delay = delay;
    this.locked = false;
  }

  call (fn, ...args) {
    if (this.locked) return;
    this.locked = true;
    fn(...args);
    setTimeout(() => {
      this.locked = false;
    }, this.delay);
  }
}
