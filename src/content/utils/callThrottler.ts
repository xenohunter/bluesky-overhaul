export class CallThrottler {
  readonly #delay: number;
  #locked: boolean;

  constructor (delay: number) {
    this.#delay = delay;
    this.#locked = false;
  }

  call (fn: (...args: any) => any, ...args: any): void {
    if (this.#locked) return;
    this.#locked = true;
    fn(...args);
    setTimeout(() => {
      this.#locked = false;
    }, this.#delay);
  }
}
