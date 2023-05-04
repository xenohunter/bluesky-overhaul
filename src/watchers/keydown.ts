import {IPausable, ISettingsSubscriber} from '../interfaces';
import {TSetting, TSettings} from '../browser/api';
import {APP_SETTINGS} from '../browser/appSettings';
import {Watcher} from './watcher';
import {VimKeybindingsHandler} from './helpers/vimKeybindings';
import {ultimatelyFind} from '../dom/utils';
import {Selector} from '../dom/selector';

const DEFAULT_SETTINGS: TSettings = {
  [APP_SETTINGS.HANDLE_VIM_KEYBINDINGS]: false
};

const LEFT_ARROW_BUTTON = new Selector('[aria-label="Previous image"]', {exhaustAfter: 0});
const RIGHT_ARROW_BUTTON = new Selector('[aria-label="Next image"]', {exhaustAfter: 0});
const PHOTO_KEYS = ['ArrowLeft', 'ArrowRight'];

export class KeydownWatcher extends Watcher implements IPausable, ISettingsSubscriber {
  readonly #container: HTMLElement;
  readonly #vimHandler: VimKeybindingsHandler;
  #isPaused = false;

  constructor(targetContainer: HTMLElement, vimContainer: HTMLElement) {
    super();
    this.#container = targetContainer;
    this.#vimHandler = new VimKeybindingsHandler(vimContainer, true);
  }

  watch(): void {
    document.addEventListener('keydown', this.#onKeydown.bind(this));
  }

  start(): void {
    if (!this.#isPaused) return;
    this.#vimHandler.start();
    this.#isPaused = false;
  }

  pause(): void {
    if (this.#isPaused) return;
    this.#vimHandler.pause();
    this.#isPaused = true;
  }

  onSettingChange(name: APP_SETTINGS, value: TSetting): void {
    if (!this.SETTINGS.includes(name)) throw new Error(`Unknown setting name "${name}"`);
    if (typeof value !== typeof DEFAULT_SETTINGS[name]) throw new Error(`Invalid value "${value}" for "${name}"`);

    if (name === APP_SETTINGS.HANDLE_VIM_KEYBINDINGS) {
      if (value === true) {
        this.#vimHandler.start();
      } else {
        this.#vimHandler.pause();
      }
    }
  }

  get SETTINGS(): APP_SETTINGS[] {
    return Object.keys(DEFAULT_SETTINGS) as APP_SETTINGS[];
  }

  #onKeydown(event: KeyboardEvent): void {
    if (this.#isPaused || event.ctrlKey || event.metaKey) return;

    if (PHOTO_KEYS.includes(event.key)) {
      Promise.all([
        ultimatelyFind(this.#container, LEFT_ARROW_BUTTON).catch(() => null),
        ultimatelyFind(this.#container, RIGHT_ARROW_BUTTON).catch(() => null)
      ]).then(([leftArrow, rightArrow]) => {
        if (event.key === 'ArrowLeft' && leftArrow !== null) {
          leftArrow.click();
        } else if (event.key === 'ArrowRight' && rightArrow !== null) {
          rightArrow.click();
        }
      });
    } else {
      this.#vimHandler.handle(event);
    }
  }
}
