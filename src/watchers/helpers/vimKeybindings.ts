const VIM_KEY_MAP = {
  '?': 'show_help',
  '/': 'search',
  '.': 'load_new_posts',
  'j': 'next_post',
  'k': 'previous_post',
  'l': 'like',
  'n': 'new_post',
  'o': 'expand_photo',
  'r': 'reply',
  't': 'repost',
  'Enter': 'open_post'
};

export class VimKeybindingsHandler {
  readonly #container: HTMLElement;
  #isEnabled = false;

  constructor(targetContainer: HTMLElement) {
    this.#container = targetContainer;
  }

  enable(): void {
    this.#isEnabled = true;
  }

  disable(): void {
    this.#isEnabled = false;
  }

  handle(key: string): void {
    if (!this.#isEnabled || !(key in VIM_KEY_MAP)) return;
    throw new Error('Not implemented');
  }
}
