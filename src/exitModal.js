import {getComposePostModal, getExitButton} from './elementsFinder';

const EVENT_OPTIONS = {once: true};

export class ExitModalPipeline {
  constructor() {
    this.modal = null;
    this.callbacks = {};
  }

  deploy(modalContainer) {
    if (this.modal !== null) return;

    this.modal = getComposePostModal(modalContainer);
    this.exitButton = getExitButton(this.modal);

    this.callbacks.click = this.onClick.bind(this);
    this.callbacks.keydown = this.onEscape.bind(this);
    this.callbacks.stop = this.removeEvents.bind(this);

    document.addEventListener('click', this.callbacks.click, EVENT_OPTIONS);
    document.addEventListener('keydown', this.callbacks.keydown, EVENT_OPTIONS);
    this.exitButton.addEventListener('click', this.callbacks.stop, EVENT_OPTIONS);
  }

  terminate() {
    if (this.modal === null) return;

    this.modal = this.exitButton = null;
    this.callbacks = {};
  }

  removeEvents() {
    try { document.removeEventListener('click', this.callbacks.click); } catch (e) {}
    try { document.removeEventListener('keydown', this.callbacks.keydown); } catch (e) {}
    try { this.exitButton.removeEventListener('click', this.callbacks.stop); } catch (e) {}
  }

  onClick(event) {
    if (this.modal && !this.modal.contains(event.target) && event.target !== this.exitButton) {
      this.removeEvents();
      this.exitButton.click();
    }
  }

  onEscape(event) {
    if (event.key === 'Escape') {
      this.removeEvents();
      this.exitButton.click();
    }
  }
}
