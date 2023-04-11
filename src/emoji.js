import data from '@emoji-mart/data';
import { Picker } from 'emoji-mart';

const LAST_TAB_INDEX = 0;

const COMPOSE_POST_SELECTOR = '[data-testid="composePostView"]';
const BUTTON_ROW_SELECTOR = 'div[tabindex] > div:nth-child(3)';
const PHOTO_BUTTON_SELECTOR = `div[tabIndex="${LAST_TAB_INDEX}"]`;


const createEmojiPopup = (modal, emojiButton) => {
  const emojiPopup = document.createElement('div');
  emojiPopup.style.position = 'absolute';
  emojiPopup.style.display = 'none';

  const modalCoords = modal.getBoundingClientRect();
  const emojiButtonCoords = emojiButton.getBoundingClientRect();
  emojiPopup.style.left = emojiButtonCoords.x - modalCoords.x + 'px';
  emojiPopup.style.top = emojiButtonCoords.y - modalCoords.y + emojiButtonCoords.height + 'px';

  return emojiPopup;
};


export class EmojiPipeline {
  constructor() {
    this.modal = null;
    this.expanded = false;
  }

  deploy(modalContainer) {
    if (this.modal !== null) return;

    this.modal = EmojiPipeline.getComposePostModal(modalContainer);
    this.picker = this.createPicker();

    this.buttonRow = this.modal.querySelector(BUTTON_ROW_SELECTOR);
    this.photoButton = this.buttonRow.querySelector(PHOTO_BUTTON_SELECTOR);
    this.emojiButton = this.photoButton.cloneNode(false);

    this.emojiButton.innerHTML = '😀';
    this.emojiButton.setAttribute('tabIndex', `${LAST_TAB_INDEX + 1}`);

    this.photoButton.insertAdjacentElement('afterend', this.emojiButton);

    this.emojiPopup = createEmojiPopup(this.modal, this.emojiButton);
    this.emojiPopup.appendChild(this.picker);
    this.modal.appendChild(this.emojiPopup);

    this.emojiButton.addEventListener('click', () => {
      if (this.expanded) return;

      this.emojiPopup.style.display = 'block';
      this.expanded = true;

      const clickOutside = (event) => {
        if (this.emojiPopup && !this.emojiPopup.contains(event.target) && event.target !== this.emojiButton) {
          this.emojiPopup.style.display = 'none';
          this.expanded = false;
          this.modal.removeEventListener('click', clickOutside);
          document.removeEventListener('click', clickOutside);
        }
      };

      this.modal.addEventListener('click', clickOutside);
      document.addEventListener('click', clickOutside);
    });
  }

  terminate() {
    if (this.modal !== null) {
      try { this.emojiPopup.removeChild(this.picker); } catch (e) {}
      try { this.modal.removeChild(this.emojiPopup); } catch (e) {}
      try { this.buttonRow.removeChild(this.emojiButton); } catch (e) {}
      this.modal = this.picker = this.buttonRow = this.photoButton = this.emojiButton = this.emojiPopup = null;
    }
  }

  createPicker() {
    return new Picker({
      data,
      emojiSize: 22,
      onEmojiSelect: emoji => {
        this.getContentEditable().focus();
        document.execCommand('insertText', false, emoji.native);
      }
    });
  }

  getContentEditable() {
    return this.modal.querySelector('div.ProseMirror');
  }

  static getComposePostModal(modalContainer) {
    return modalContainer.querySelector(COMPOSE_POST_SELECTOR);
  }

  static isEligible(modalContainer) {
    return EmojiPipeline.getComposePostModal(modalContainer) !== null;
  }
}
