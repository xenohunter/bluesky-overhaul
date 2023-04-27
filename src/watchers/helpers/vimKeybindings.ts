import {ultimatelyFindAll} from '../../dom/utils';

const VIM_KEY_MAP = {};
export const VIM_KEYS = Object.keys(VIM_KEY_MAP);

export class VimKeybindingsHandler {
  readonly #container: HTMLElement;
  #isEnabled = false;

  constructor(targetContainer: HTMLElement) {
    this.#container = targetContainer;
  }

  enable() {
    this.#isEnabled = true;
  }

  disable() {
    this.#isEnabled = false;
  }

  handle(key: string): void {
    throw new Error('Not implemented');
  }
}
