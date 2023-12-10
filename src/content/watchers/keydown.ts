import {TSetting, TSettings} from '../../types';
import {IPausable, ISettingsSubscriber} from '../../interfaces';
import {APP_SETTINGS} from '../../shared/appSettings';
import {Watcher} from './watcher';
import {VimKeybindingsHandler} from './helpers/vimKeybindings';

const DEFAULT_SETTINGS: Partial<TSettings> = {
  [APP_SETTINGS.HANDLE_VIM_KEYBINDINGS]: false
};

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
    this.#vimHandler.handle(event);
  }
}
