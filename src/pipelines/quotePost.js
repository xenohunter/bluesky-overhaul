import {getComposePostModal, getContentEditable, getLinkButton} from '../utils/elementsFinder';
import {typeText, backspace} from '../utils/text';

const STAGING_URL_REGEX = /.*(https:\/\/staging\.bsky\.app\/profile\/.*\/post\/.*\/?)$/;
const URL_REGEX = /.*(https:\/\/bsky\.app\/profile\/.*\/post\/.*\/?)$/;
const EVENT_OPTIONS = {capture: true};

export class QuotePostPipeline {
  constructor() {
    this.modal = null;
  }

  deploy(modalContainer) {
    if (this.modal !== null) return;

    this.modal = getComposePostModal(modalContainer);

    setTimeout(() => {
      this.callback = this.onPaste.bind(this);
      this.contentEditable = getContentEditable(this.modal);
      this.contentEditable.addEventListener('paste', this.callback, EVENT_OPTIONS);
    }, 0);
  }

  terminate() {
    if (this.modal === null) return;

    this.contentEditable.removeEventListener('paste', this.callback, EVENT_OPTIONS);
    this.modal = this.callback = this.contentEditable = null;
  }

  onPaste(event) {
    event.preventDefault();

    let data = event.clipboardData.getData('text/plain');
    if (data.match(STAGING_URL_REGEX) !== null) {
      data = data.replace('https://staging.bsky.app/', 'https://bsky.app/');
    }

    this.contentEditable.focus();
    typeText(data);
    typeText(' ');

    setTimeout(() => {
      const lastChar = this.contentEditable.textContent.slice(-1);
      if (lastChar === ' ') backspace();
      if (data.match(URL_REGEX) !== null) getLinkButton(this.modal)?.click();
    }, 50);
  }
}