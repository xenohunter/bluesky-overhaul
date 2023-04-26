import {getCurrentCursorPosition, setCurrentCursorPosition} from './selection';

export class Cursor {
  #position: number;
  readonly #contentEditable: HTMLElement;

  constructor(contentEditable: HTMLElement) {
    this.#contentEditable = contentEditable;
    this.#position = 0;
  }

  save() {
    this.#position = getCurrentCursorPosition(this.#contentEditable);
  }

  restore() {
    this.#contentEditable.focus();
    setCurrentCursorPosition(this.#position, this.#contentEditable);
  }

  move(step: number) {
    if (this.#contentEditable.textContent === null) return;
    this.#position += step;
    if (this.#position < 0) {
      this.#position = 0;
    } else if (this.#position > this.#contentEditable.textContent.length) {
      this.#position = this.#contentEditable.textContent.length;
    }
  }
}
