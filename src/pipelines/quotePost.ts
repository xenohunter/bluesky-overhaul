import {COMPOSE_CONTENT_EDITABLE, COMPOSE_LINK_CARD_BUTTON} from '../dom/selectors';
import {log} from '../utils/logger';
import {typeText, backspace} from '../utils/text';
import {Pipeline} from './pipeline';
import {ultimatelyFind} from '../dom/utils';
import {EventKeeper} from '../utils/eventKeeper';

const STAGING_URL_REGEX = /.*(https:\/\/staging\.bsky\.app\/profile\/.*\/post\/.*\/?)$/;
const URL_REGEX = /.*(https:\/\/bsky\.app\/profile\/.*\/post\/.*\/?)$/;

export class QuotePostPipeline extends Pipeline {
  #modal: HTMLElement | null;
  #contentEditable: HTMLElement | null;
  readonly #eventKeeper: EventKeeper;

  constructor() {
    super();
    this.#modal = null;
    this.#contentEditable = null;
    this.#eventKeeper = new EventKeeper();
  }

  deploy(modal: HTMLElement) {
    if (this.#modal !== null) {
      log('QuotePostPipeline is already deployed');
      return;
    }

    this.#modal = modal;

    ultimatelyFind(modal, COMPOSE_CONTENT_EDITABLE).then((contentEditable) => {
      this.#contentEditable = contentEditable;
      this.#eventKeeper.add(contentEditable, 'paste', this.onPaste.bind(this), {capture: true});
    });
  }

  terminate() {
    if (this.#modal === null) {
      log('QuotePostPipeline is not deployed');
      return;
    }

    this.#eventKeeper.cancelAll();
    this.#modal = this.#contentEditable = null;
  }

  onPaste(event: ClipboardEvent) {
    if (!event.clipboardData || !this.#contentEditable) return;
    if (event.clipboardData.types.indexOf('text/plain') === -1) return;

    event.preventDefault();
    const contentEditable = this.#contentEditable;

    let data = event.clipboardData.getData('text/plain');
    if (data.match(STAGING_URL_REGEX) !== null) {
      data = data.replace('https://staging.bsky.app/', 'https://bsky.app/');
    }

    contentEditable.focus();
    typeText(data);
    typeText(' '); // Add a space after the link for it to resolve as one

    // Wait for the text to be inserted into the contentEditable
    setTimeout(() => {
      const lastChar = contentEditable.textContent?.slice(-1) ?? '';
      if (lastChar === ' ') backspace();
      if (data.match(URL_REGEX) !== null) {
        this.#modal && ultimatelyFind(this.#modal, COMPOSE_LINK_CARD_BUTTON).then((linkCardButton) => {
          linkCardButton.click();
        });
      }
    }, 50);
  }
}
