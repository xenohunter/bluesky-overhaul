import {IPausable, ISettingsSubscriber} from '../interfaces';
import {TSetting, TSettings} from '../browser/api';
import {APP_SETTINGS} from '../browser/appSettings';
import {Watcher} from './watcher';
import {VimKeybindingsHandler} from './helpers/vimKeybindings';

const DEFAULT_SETTINGS: TSettings = {
  [APP_SETTINGS.HANDLE_VIM_KEYBINDINGS]: false
};

const SVG_ARROW_SELECTOR = 'svg[viewBox="0 0 256 512"][height="40"][width="40"]';
const MODAL_IMAGE_SELECTOR = 'img[alt][draggable="false"]';
const PHOTO_KEYS = ['ArrowLeft', 'ArrowRight', 'Escape'];

const getElementPositionX = (elem: HTMLElement): number => {
  const rect = elem.getBoundingClientRect();
  return rect.left + rect.width / 2;
};

const locateArrows = (): [HTMLElement | null, HTMLElement | null] => {
  const svgElements = document.querySelectorAll(SVG_ARROW_SELECTOR);
  const sideArrows = Array.from(svgElements).map((svg) => svg.parentElement);
  const windowCenter = window.innerWidth / 2;

  let leftArrow = null;
  let rightArrow = null;

  if (sideArrows.length === 1) {
    if (getElementPositionX(sideArrows[0] as HTMLElement) < windowCenter) {
      leftArrow = sideArrows[0];
    } else {
      rightArrow = sideArrows[0];
    }
  } else if (sideArrows.length === 2) {
    [leftArrow, rightArrow] = sideArrows;
  }

  return [leftArrow, rightArrow];
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

  #closePhotoModal(): boolean {
    const photoModal = this.#container.lastChild?.firstChild as HTMLElement;
    const photoModalChild = photoModal?.firstChild as HTMLElement;
    const photoModalImage = photoModalChild?.querySelector(MODAL_IMAGE_SELECTOR);

    if (photoModalImage && photoModalImage?.parentElement?.getAttribute('data-testid') !== 'userAvatarImage') {
      photoModal.click();
      return true;
    } else {
      return false;
    }
  }

  #onKeydown(event: KeyboardEvent): void {
    if (this.#isPaused || event.ctrlKey || event.metaKey) return;

    if (PHOTO_KEYS.includes(event.key)) {
      const [leftArrow, rightArrow] = locateArrows();
      if (event.key === 'ArrowLeft' && leftArrow !== null) {
        leftArrow.click();
      } else if (event.key === 'ArrowRight' && rightArrow !== null) {
        rightArrow.click();
      } else if (event.key === 'Escape') {
        const wasModalClosed = this.#closePhotoModal();
        !wasModalClosed && this.#vimHandler.handle(event);
      }
    } else {
      this.#vimHandler.handle(event);
    }
  }
}
