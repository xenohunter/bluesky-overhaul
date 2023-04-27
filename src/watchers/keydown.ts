import {IPausable, ISettingsSubscriber} from '../interfaces';
import {TSetting} from '../browser/settingsManager';
import {HANDLE_VIM_KEYBINDINGS} from '../browser/settings';
import {Watcher} from './watcher';
import {VIM_KEYS, VimKeybindingsHandler} from './helpers/vimKeybindings';

const DEFAULT_SETTINGS: { [key: string]: TSetting } = {
  VIM_KEYBINDINGS: false
};

const SVG_ARROW_SELECTOR = 'svg[viewBox="0 0 256 512"][height="40"][width="40"]';
const MODAL_IMAGE_SELECTOR = 'img[alt][draggable="false"]';
const PHOTO_KEYS = ['ArrowLeft', 'ArrowRight', 'Escape'];

const getElementPositionX = (elem: HTMLElement) => {
  const rect = elem.getBoundingClientRect();
  return rect.left + rect.width / 2;
};

const locateArrows = () => {
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

  constructor(targetContainer: HTMLElement) {
    super();
    this.#container = targetContainer;
    this.#vimHandler = new VimKeybindingsHandler(targetContainer);
  }

  watch() {
    document.addEventListener('keydown', this.#onKeydown.bind(this));
  }

  pause() {
    this.#isPaused = true;
  }

  resume() {
    this.#isPaused = false;
  }

  onSettingChange(name: string, value: TSetting) {
    if (!this.SETTINGS.includes(name)) throw new Error(`Unknown setting name "${name}"`);
    if (typeof value !== typeof DEFAULT_SETTINGS[name]) throw new Error(`Invalid value "${value}" for "${name}"`);

    if (name === HANDLE_VIM_KEYBINDINGS) {
      if (value) {
        this.#vimHandler.enable();
      } else {
        this.#vimHandler.disable();
      }
    }
  }

  get SETTINGS() {
    return Object.keys(DEFAULT_SETTINGS);
  }

  #closePhotoModal() {
    const photoModal = this.#container.lastChild?.firstChild as HTMLElement;
    const photoModalChild = photoModal?.firstChild as HTMLElement;
    const photoModalImage = photoModalChild?.querySelector(MODAL_IMAGE_SELECTOR);
    if (photoModalImage && photoModalImage?.parentElement?.getAttribute('data-testid') !== 'userAvatarImage') {
      photoModal.click();
    }
  }

  #onKeydown(event: KeyboardEvent) {
    if (this.#isPaused) return;

    console.log(event.key); // TODO!

    if (event.key in PHOTO_KEYS) {
      const [leftArrow, rightArrow] = locateArrows();
      if (event.key === 'ArrowLeft' && leftArrow !== null) {
        leftArrow.click();
      } else if (event.key === 'ArrowRight' && rightArrow !== null) {
        rightArrow.click();
      } else if (event.key === 'Escape') {
        this.#closePhotoModal();
      }
    } else if (event.key in VIM_KEYS) {
      this.#vimHandler.handle(event.key);
    }
  }
}
