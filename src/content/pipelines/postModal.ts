import {IPausable} from '../../interfaces';
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
    if (this.#modal !== null) return;

    this.#pauseOuterServices();
    this.#modal = modal;

    Promise.all([
      ultimatelyFind(modal, COMPOSE_CANCEL_BUTTON),
      ultimatelyFind(modal, COMPOSE_CONTENT_EDITABLE)
    ]).then(([exitButton, contentEditable]) => {
      this.#exitButton = exitButton;
      this.#contentEditable = contentEditable;

      const backdrop = this.#modal?.parentElement?.parentElement;
      if (!backdrop) throw new Error('Modal backdrop not found');

      // TODO : if you have text in modal and click on Cancel, you are prompted with a confirmation dialog
      // TODO : if stay with the modal, the events are not restored and backdrop clicks don't work anymore
      this.#eventKeeper.add(backdrop, 'click', this.#onClick.bind(this));
      this.#eventKeeper.add(exitButton, 'click', () => this.#eventKeeper.cancelAll());
    }).catch((error) => {
      log('PostModalPipeline failed to deploy', error);
      this.terminate();
    });
  }

  terminate(): void {
    if (this.#modal === null) return;

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

  #onClick(event: MouseEvent): void {
    if (this.#paused) return;

    const target = event.target as HTMLElement;
    if (target?.tagName.toLowerCase() === 'button') return;

    if (!this.#modal?.contains(target) && target !== this.#exitButton) {
      this.#eventKeeper.cancelAll();
      this.#exitButton?.click();
    }
  }
}
