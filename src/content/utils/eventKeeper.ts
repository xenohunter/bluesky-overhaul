import type {TEventKey, TEventListener, TEventOptions} from '../../types';
import {noop} from '../../shared/misc';

type TElement = Element | Document | Window;
type TEventListenerUnion = TEventListener<Event> | TEventListener<KeyboardEvent> | TEventListener<ClipboardEvent> | TEventListener<MouseEvent>;

type TEventRequisites = {
  element: TElement;
  event: TEventKey;
  listener: TEventListenerUnion;
  options?: TEventOptions;
};

export class EventKeeper {
  #events: TEventRequisites[] = [];

  add(element: TElement, eventKey: TEventKey, listener: TEventListenerUnion, options?: TEventOptions): void {
    try {
      element.addEventListener(eventKey, listener as TEventListener<Event>, options);
      this.#events.push({element, event: eventKey, listener, options});
    } catch (e) {
      noop();
    }
  }

  cancelAll(): void {
    for (const {element, event, listener, options} of this.#events) {
      try {
        element.removeEventListener(event, listener as TEventListener<Event>, options);
      } catch (e) {
        noop();
      }
    }

    this.#events = [];
  }
}
