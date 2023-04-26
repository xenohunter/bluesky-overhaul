import {log} from '../utils/logger';
import {Pipeline} from './pipeline';
import {EventKeeper} from '../utils/eventKeeper';
import {COMPOSE_CANCEL_BUTTON, COMPOSE_POST_BUTTON, COMPOSE_CONTENT_EDITABLE} from '../dom/selectors';
import {ultimatelyFind} from '../dom/utils';


export class PostModalPipeline extends Pipeline {
  #modal: HTMLElement | null;
  #exitButton: HTMLElement | null;
  #contentEditable: HTMLElement | null;
  readonly #eventKeeper: EventKeeper;
  #paused: boolean;

  constructor() {
    super();
    this.#modal = null;
    this.#exitButton = null;
    this.#contentEditable = null;
    this.#eventKeeper = new EventKeeper();
    this.#paused = false;
  }

  deploy(modal: HTMLElement) {
    if (this.#modal !== null) {
      log('PostModalPipeline is already deployed');
      return;
    }

    this.#modal = modal;

    Promise.all([
      ultimatelyFind(modal, COMPOSE_CANCEL_BUTTON),
      ultimatelyFind(modal, COMPOSE_CONTENT_EDITABLE)
    ]).then(([exitButton, contentEditable]) => {
      this.#exitButton = exitButton;
      this.#contentEditable = contentEditable;

      const clickCallback = this.onClick.bind(this);
      const keydownCallback = this.onKeydown.bind(this);
      const stopCallback = () => this.#eventKeeper.cancelAll();

      this.#eventKeeper.add(document, 'click', clickCallback);
      this.#eventKeeper.add(document, 'keydown', keydownCallback);
      this.#eventKeeper.add(exitButton, 'click', stopCallback);
      this.#eventKeeper.add(contentEditable, 'keydown', keydownCallback);
    });
  }

  terminate() {
    if (this.#modal === null) {
      log('PostModalPipeline is not deployed');
      return;
    }

    this.resume();
    this.#eventKeeper.cancelAll();
    this.#modal = this.#exitButton = this.#contentEditable = null;
  }

  pause() {
    this.#paused = true;
  }

  resume() {
    this.#paused = false;
  }

  onClick(event: Event) {
    if (this.#paused) return;

    if (!this.#modal?.contains(event.target as Node) && event.target !== this.#exitButton) {
      this.#eventKeeper.cancelAll();
      this.#exitButton?.click();
    }
  }

  onKeydown(event: KeyboardEvent) {
    if (this.#paused) return;

    if (event.key === 'Escape') {
      this.#eventKeeper.cancelAll();
      this.#exitButton?.click();
    } else if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
      this.#modal && ultimatelyFind(this.#modal, COMPOSE_POST_BUTTON).then((postButton) => {
        this.#eventKeeper.cancelAll();
        postButton.click();
      });
    }
  }
}
