import {getComposePostModal, getContentEditable, getLinkButton} from './elementsFinder';

const URL_REGEX = /.*https:\/\/staging\.bsky\.app\/profile\/.*\/post\/.*\/?$/;
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
    if (data.match(URL_REGEX) !== null) {
      data = data.replace('https://staging.bsky.app/', 'https://bsky.app/');
    }

    this.contentEditable.focus();
    document.execCommand('insertHTML', false, data);
    document.execCommand('insertHTML', false, ' ');

    setTimeout(() => {
      document.execCommand('delete', false, null);
      const linkButton = getLinkButton(this.modal);
      if (linkButton !== null) {
        linkButton.click();
        // TODO : remove the URL if the contents of this.contentEditable ends with it
      }
    }, 50);
  }
}
