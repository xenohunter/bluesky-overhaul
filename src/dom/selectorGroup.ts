import {Selector} from './selector';

export class SelectorGroup {
  readonly #selectors: Selector[];
  readonly exhaustAfter: number;

  constructor(selectors: Selector[]) {
    if (selectors.some((selector) => selector.exhaustAfter !== selectors[0].exhaustAfter)) {
      throw new Error('All selectors in a group must have the same exhaustAfter value');
    }

    this.#selectors = selectors;
    this.exhaustAfter = selectors[0].exhaustAfter;
  }

  retrieveFrom(elements: HTMLElement[]): HTMLElement[] {
    const result = this.#selectors.map((selector) => selector.retrieveFrom(elements));
    return result.flat();
  }
}