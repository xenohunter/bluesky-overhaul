import data from '@emoji-mart/data';
import {Picker} from 'emoji-mart';
import {Cursor} from '../utils/cursor';
import {getButtonRow, getContentEditable, getPhotoButton, LAST_TAB_INDEX} from '../utils/elementsFinder';
import {log} from '../utils/logger';
import {typeText} from '../utils/text';
import {Pipeline} from './pipeline';

const EMOJI_CHARACTER_LENGTH = 2;

const createEmojiButton = (rightmostButton) => {
  const emojiButton = rightmostButton.cloneNode(false);
  emojiButton.innerHTML = '😀';
  emojiButton.setAttribute('tabIndex', `${LAST_TAB_INDEX + 1}`);
  return emojiButton;
}

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

export class EmojiPipeline extends Pipeline {
  constructor(pauseExitModal, resumeExitModal) {
    super();
    this.modal = null;
    this.buttonCallback = null;
    this.outerCallback = null;
    this.expanded = false;
    this.pauseExitModal = pauseExitModal;
    this.resumeExitModal = resumeExitModal;
  }

  deploy(modal, modalType = 'compose') {
    if (modalType !== 'compose') throw new Error('EmojiPipeline only supports compose modal');
    if (this.modal !== null) {
      log('EmojiPipeline already deployed');
      return;
    }

    this.modal = modal;
    this.picker = this.createPicker();

    this.buttonRow = getButtonRow(this.modal);
    this.photoButton = getPhotoButton(this.buttonRow);

    this.emojiButton = createEmojiButton(this.photoButton);
    this.photoButton.insertAdjacentElement('afterend', this.emojiButton);

    this.emojiPopup = createEmojiPopup(this.modal, this.emojiButton);
    this.emojiPopup.appendChild(this.picker);
    this.modal.appendChild(this.emojiPopup);

    this.buttonCallback = this.onButtonClick.bind(this);
    this.emojiButton.addEventListener('click', this.buttonCallback);

    setTimeout(() => {
      this.contentEditable = getContentEditable(this.modal);
      this.cursor = new Cursor(this.contentEditable);
      this.outerCallback = () => this.cursor.save();
      this.contentEditable.addEventListener('keyup', this.outerCallback);
      this.contentEditable.addEventListener('mouseup', this.outerCallback);
    }, 0);
  }

  terminate() {
    if (this.modal === null) return;

    try {this.emojiButton.removeEventListener('click', this.buttonCallback);} catch (e) {}
    try {this.contentEditable.removeEventListener('keyup', this.outerCallback);} catch (e) {}
    try {this.contentEditable.removeEventListener('mouseup', this.outerCallback);} catch (e) {}
    this.buttonCallback = this.outerCallback = null;

    try {this.emojiPopup.removeChild(this.picker);} catch (e) {}
    try {this.modal.removeChild(this.emojiPopup);} catch (e) {}
    try {this.buttonRow.removeChild(this.emojiButton);} catch (e) {}
    this.modal = this.buttonRow = this.photoButton = this.emojiButton = this.emojiPopup = null;
    this.picker = this.cursor = null;
  }

  createPicker() {
    return new Picker({
      data,
      emojiSize: 22,
      onEmojiSelect: emoji => {
        this.cursor.restore();
        typeText(emoji.native);
        this.cursor.move(EMOJI_CHARACTER_LENGTH);
      }
    });
  }

  onButtonClick() {
    if (this.expanded) return;

    this.emojiPopup.style.display = 'block';
    this.expanded = true;
    this.pauseExitModal();

    const clickOutside = (event) => {
      if (this.emojiPopup && !this.emojiPopup.contains(event.target) && event.target !== this.emojiButton) {
        this.emojiPopup.style.display = 'none';
        this.expanded = false;
        this.modal.removeEventListener('click', clickOutside);
        document.removeEventListener('click', clickOutside);
        this.resumeExitModal();
      }
    };

    this.modal.addEventListener('click', clickOutside);
    document.addEventListener('click', clickOutside);
  }
}
