import {IPausable} from '../interfaces';
import {log} from '../utils/logger';
import {Pipeline} from './pipeline';
import {EventKeeper} from '../utils/eventKeeper';
import {COMPOSE_CANCEL_BUTTON, COMPOSE_CONTENT_EDITABLE} from '../dom/selectors';
import {ultimatelyFind} from '../dom/utils';


export class PostModalPipeline extends Pipeline implements IPausable {
  #modal: HTMLElement | null;
  #exitButton: HTMLElement | null;
  #contentEditable: HTMLElement | null;
  readonly #eventKeeper: EventKeeper;
  readonly #pauseOuterServices: () => void;
  readonly #resumeOuterServices: () => void;
  #paused = false;

  constructor(pauseCallback: () => void, resumeCallback: () => void) {
    super();
    this.#modal = null;
    this.#exitButton = null;
    this.#contentEditable = null;
    this.#eventKeeper = new EventKeeper();
    this.#pauseOuterServices = pauseCallback;
    this.#resumeOuterServices = resumeCallback;
  }

  deploy(modal: HTMLElement): void {
    if (this.#modal !== null) {
      log('PostModalPipeline is already deployed');
      return;
    }

    this.#pauseOuterServices();
    this.#modal = modal;

    Promise.all([
      ultimatelyFind(modal, COMPOSE_CANCEL_BUTTON),
      ultimatelyFind(modal, COMPOSE_CONTENT_EDITABLE)
    ]).then(([exitButton, contentEditable]) => {
      this.#exitButton = exitButton;
      this.#contentEditable = contentEditable;

      this.#eventKeeper.add(document, 'click', this.#onClick.bind(this));
      this.#eventKeeper.add(contentEditable, 'mousedown', this.#onPresumedSelect.bind(this));
      this.#eventKeeper.add(exitButton, 'click', () => this.#eventKeeper.cancelAll());
    });
  }

  terminate(): void {
    if (this.#modal === null) {
      log('PostModalPipeline is not deployed');
      return;
    }

    this.start();
    this.#eventKeeper.cancelAll();
    this.#modal = this.#exitButton = this.#contentEditable = null;
    this.#resumeOuterServices();
  }

  start(): void {
    this.#paused = false;
  }

  pause(): void {
    this.#paused = true;
  }

  #onClick(event: Event): void {
    if (this.#paused) return;

    // TODO : this is a hotfix, need to find a better solution
    const target = event.target as HTMLElement;
    if (target?.tagName.toLowerCase() === 'button') return;

    if (!this.#modal?.contains(event.target as Node) && event.target !== this.#exitButton) {
      this.#eventKeeper.cancelAll();
      this.#exitButton?.click();
    }
  }

  #onPresumedSelect(): void {
    if (this.#paused) return;

    this.pause();
    document.addEventListener('mouseup', () => setTimeout(this.start.bind(this), 0), {once: true});
  }
}
