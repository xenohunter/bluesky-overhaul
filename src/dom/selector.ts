import {FIRST_CHILD_MARKER, LAST_CHILD_MARKER} from './constants';

const DEFAULT_SEARCH_TIMEOUT = 2000;

export class Selector {
  // TODO : add .matches(element: HTMLElement) method

  readonly selector: string;
  readonly #firstOnly: boolean;
  readonly exhaustAfter: number;

  constructor(selector: string, {firstOnly = false, exhaustAfter = DEFAULT_SEARCH_TIMEOUT} = {}) {
    this.selector = selector;
    this.#firstOnly = firstOnly;
    this.exhaustAfter = exhaustAfter;
  }

  retrieveFrom(elements: HTMLElement[]): HTMLElement[] {
    let result;
    if (this.selector === FIRST_CHILD_MARKER) {
      result = elements.map((elem) => elem.firstChild);
    } else if (this.selector === LAST_CHILD_MARKER) {
      result = elements.map((elem) => elem.lastChild);
    } else if (this.#firstOnly) {
      result = elements.map((elem) => elem.querySelector(this.selector));
    } else {
      result = elements.map((elem) => Array.from(elem.querySelectorAll(this.selector))).flat();
    }

    return result.filter((elem) => elem !== null && elem !== undefined) as HTMLElement[];
  }

  clone(): Selector {
    return new Selector(this.selector, {firstOnly: this.#firstOnly, exhaustAfter: this.exhaustAfter});
  }
}
