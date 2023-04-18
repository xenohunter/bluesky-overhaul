import {getContentEditable, getExitButton, getPostButton} from '../utils/elementsFinder';
import {log} from '../utils/logger';

export class PostModalPipeline {
  constructor() {
    this.modal = null;
    this.exitButton = null;
    this.callbacks = {};
    this.paused = false;
  }

  deploy(modal, modalType = 'compose') {
    if (modalType !== 'compose') throw new Error('PostModalPipeline only supports compose modal');
    if (this.modal !== null) {
      log('PostModalPipeline is already deployed');
      return;
    }

    this.modal = modal;
    this.exitButton = getExitButton(this.modal);

    this.callbacks.click = this.onClick.bind(this);
    this.callbacks.keydown = this.onKeydown.bind(this);
    this.callbacks.stop = this.removeEvents.bind(this);

    document.addEventListener('click', this.callbacks.click);
    document.addEventListener('keydown', this.callbacks.keydown);
    this.exitButton.addEventListener('click', this.callbacks.stop);

    setTimeout(() => {
      this.contentEditable = getContentEditable(this.modal);
      this.contentEditable.addEventListener('keydown', this.callbacks.keydown);
    }, 0);
  }

  terminate() {
    if (this.modal === null) return;

    this.removeEvents();
    this.modal = this.exitButton = null;
    this.callbacks = {};
  }

  pauseExit() {
    this.paused = true;
  }

  resumeExit() {
    this.paused = false;
  }

  removeEvents() {
    try { document.removeEventListener('click', this.callbacks.click); } catch (e) {}
    try { document.removeEventListener('keydown', this.callbacks.keydown); } catch (e) {}
    try { this.exitButton.removeEventListener('click', this.callbacks.stop); } catch (e) {}
    try { this.contentEditable.removeEventListener('keydown', this.callbacks.keydown); } catch (e) {}
  }

  onClick(event) {
    if (!this.paused && this.modal && !this.modal.contains(event.target) && event.target !== this.exitButton) {
      this.removeEvents();
      this.exitButton.click();
    }
  }

  onKeydown(event) {
    if (!this.paused && event.key === 'Escape') {
      this.removeEvents();
      this.exitButton.click();
    } else if (!this.paused && event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
      this.removeEvents();
      getPostButton(this.modal).click();
    }
  }
}
