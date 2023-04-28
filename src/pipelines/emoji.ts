import {Picker} from 'emoji-mart';
import {emojiData} from '../hacks/emojiDataWrapper';
import {ultimatelyFind} from '../dom/utils';
import {COMPOSE_BUTTON_ROW, COMPOSE_PHOTO_BUTTON, COMPOSE_CONTENT_EDITABLE} from '../dom/selectors';
import {Cursor} from '../utils/cursor';
import {EventKeeper} from '../utils/eventKeeper';
import {log} from '../utils/logger';
import {typeText} from '../utils/text';
import {Pipeline} from './pipeline';
import {noop} from '../utils/misc';

const EMOJI_CHARACTER_LENGTH = 2;

const createEmojiButton = (rightmostButton: HTMLElement): HTMLElement => {
  const emojiButton = rightmostButton.cloneNode(false) as HTMLElement;
  emojiButton.innerHTML = '😀';
  return emojiButton;
};

const createEmojiPopup = (modal: HTMLElement, emojiButton: HTMLElement): HTMLElement => {
  const emojiPopup = document.createElement('div');
  emojiPopup.style.position = 'absolute';
  emojiPopup.style.display = 'none';

  const modalCoords = modal.getBoundingClientRect();
  const emojiButtonCoords = emojiButton.getBoundingClientRect();
  emojiPopup.style.left = emojiButtonCoords.x - modalCoords.x + 'px';
  emojiPopup.style.top = emojiButtonCoords.y - modalCoords.y + emojiButtonCoords.height + 'px';

  return emojiPopup;
};

export class EmojiPipeline extends Pipeline {
  #modal: HTMLElement | null;
  #picker: Picker | null;
  #cursor: Cursor | null;
  readonly #eventKeeper: EventKeeper;
  #elems: { [key: string]: HTMLElement };
  #expanded: boolean;
  readonly #pauseOuterServices: () => void;
  readonly #resumeOuterServices: () => void;

  constructor(pauseCallback: () => void, resumeCallback: () => void) {
    super();
    this.#modal = null;
    this.#picker = null;
    this.#cursor = null;

    this.#eventKeeper = new EventKeeper();
    this.#elems = {};

    this.#expanded = false;
    this.#pauseOuterServices = pauseCallback;
    this.#resumeOuterServices = resumeCallback;
  }

  deploy(modal: HTMLElement): void {
    if (this.#modal !== null) {
      log('EmojiPipeline already deployed');
      return;
    }

    this.#modal = modal;
    this.#picker = this.#createPicker();

    Promise.all([
      ultimatelyFind(modal, [COMPOSE_BUTTON_ROW, COMPOSE_PHOTO_BUTTON]),
      ultimatelyFind(modal, COMPOSE_CONTENT_EDITABLE)
    ]).then(([photoButton, contentEditable]) => {
      this.#elems.photoButton = photoButton;
      this.#elems.contentEditable = contentEditable;

      this.#elems.emojiButton = createEmojiButton(this.#elems.photoButton);
      this.#elems.photoButton.insertAdjacentElement('afterend', this.#elems.emojiButton);

      this.#elems.emojiPopup = createEmojiPopup(modal, this.#elems.emojiButton);
      this.#elems.emojiPopup.appendChild(this.#picker as unknown as HTMLElement);
      modal.appendChild(this.#elems.emojiPopup);

      this.#eventKeeper.add(this.#elems.emojiButton, 'click', this.#onButtonClick.bind(this));

      this.#cursor = new Cursor(this.#elems.contentEditable);
      const outerCallback = (): void => this.#cursor?.save();
      this.#eventKeeper.add(this.#elems.contentEditable, 'keyup', outerCallback);
      this.#eventKeeper.add(this.#elems.contentEditable, 'mouseup', outerCallback);
    });
  }

  terminate(): void {
    if (this.#modal === null) {
      log('EmojiPipeline already terminated');
      return;
    }

    this.#removeElements();
    this.#eventKeeper.cancelAll();
    this.#modal = this.#picker = this.#cursor = null;
  }

  #createPicker(): Picker {
    return new Picker({
      emojiData,
      emojiSize: 22,
      onEmojiSelect: (emoji: { [key: string]: any }): void => {
        this.#cursor?.restore();
        typeText(emoji.native);
        this.#cursor?.move(EMOJI_CHARACTER_LENGTH);
        this.#focusOnPickerSearch();
      }
    });
  }

  #focusOnPickerSearch(): void {
    if (!this.#picker) return;
    const picker = this.#picker as unknown as HTMLElement;
    const input = picker.shadowRoot?.querySelector('input[type="search"]') as HTMLInputElement;
    input.focus();
  }

  #onButtonClick(): void {
    if (this.#expanded) return;

    this.#elems.emojiPopup.style.display = 'block';
    this.#expanded = true;
    this.#pauseOuterServices();
    this.#focusOnPickerSearch();

    const clickOutside = (event: Event): void => {
      const target = event.target as HTMLElement;
      if (this.#elems.emojiPopup && !this.#elems.emojiPopup.contains(target) && target !== this.#elems.emojiButton) {
        this.#elems.emojiPopup.style.display = 'none';
        this.#expanded = false;
        this.#modal?.removeEventListener('click', clickOutside);
        document.removeEventListener('click', clickOutside);
        this.#resumeOuterServices();
        this.#elems.contentEditable.focus();
      }
    };

    this.#modal?.addEventListener('click', clickOutside);
    document.addEventListener('click', clickOutside);
  }

  #removeElements(): void {
    for (const element of Object.values(this.#elems)) {
      try {
        if (element.parentElement) {
          element.parentElement.removeChild(element);
        } else {
          element.remove();
        }
      } catch (e) {
        noop();
      }
    }

    this.#elems = {};
  }
}
