const DEFAULT_SEARCH_TIMEOUT = 2000;

export const LAST_TAB_INDEX = 0;

export const FIRST_CHILD = Symbol('FIRST_CHILD');
export const LAST_CHILD = Symbol('LAST_CHILD');

export class Selector {
  constructor(selector, {firstOnly = false, exhaustAfter = DEFAULT_SEARCH_TIMEOUT} = {}) {
    this.selector = selector;
    this.firstOnly = firstOnly;
    this.exhaustAfter = exhaustAfter;
  }

  retrieveFrom(elements) {
    let result;
    if (this.selector === FIRST_CHILD || this.selector === LAST_CHILD) {
      result = elements.map((elem) => this.selector === FIRST_CHILD ? elem.firstChild : elem.lastChild);
    } else if (this.firstOnly) {
      result = elements.map((elem) => elem.querySelector(this.selector));
    } else {
      result = elements.map((elem) => Array.from(elem.querySelectorAll(this.selector))).flat();
    }

    result = result.filter((elem) => elem !== null);
    return result.length > 0 ? result : null;
  }
}

export class SelectorGroup {
  constructor(selectors) {
    if (selectors.some((selector) => selector.exhaustAfter !== selectors[0].exhaustAfter)) {
      throw new Error('All selectors in a group must have the same exhaustAfter value');
    }

    this.selectors = selectors;
    this.exhaustAfter = selectors[0].exhaustAfter;
  }

  retrieveFrom(elements) {
    let result = this.selectors.map((selector) => selector.retrieveFrom(elements));
    result = result.filter((elem) => elem !== null);
    return result.length > 0 ? result.flat() : null;
  }
}

const findInElements = (selector, elements) => {
  return new Promise((resolve, reject) => {
    const firstAttemptResult = selector.retrieveFrom(elements);
    if (firstAttemptResult) {
      resolve(firstAttemptResult);
    } else {
      const observer = new MutationObserver(() => {
        const foundElements = selector.retrieveFrom(elements);
        if (foundElements) {
          observer.disconnect();
          resolve(foundElements);
        }
      });

      for (const element of elements) {
        observer.observe(element, {childList: true, subtree: true});
      }

      setTimeout(() => {
        observer.disconnect();
        reject();
      }, selector.exhaustAfter);
    }
  });
};

export const ultimatelyFindAll = (selectors, rootElement) => {
  if (selectors instanceof Selector || selectors instanceof SelectorGroup) selectors = [selectors];
  rootElement = rootElement || document;

  return selectors.reduce(async (previousPromise, selector) => {
    const foundElements = await previousPromise;
    return findInElements(selector, foundElements);
  }, Promise.resolve([rootElement]));
};

export const ultimatelyFind = (selectors, rootElement) => {
  return ultimatelyFindAll(selectors, rootElement).then((foundElements) => foundElements?.[0] ?? null);
};

const ROOT_CONTAINER_SELECTOR = '#root > div > div';

export const getRootContainer = () => document.querySelector(ROOT_CONTAINER_SELECTOR);
export const getFeedContainer = (rootContainer) => rootContainer.firstChild.firstChild.firstChild;
export const getModalContainer = (rootContainer) => rootContainer.lastChild;

const COMPOSE_POST_SELECTOR = '[data-testid="composePostView"]';
const COMPOSE_CANCEL_BUTTON_SELECTOR = '[data-testid="composerCancelButton"]';
const COMPOSE_POST_BUTTON_SELECTOR = '[data-testid="composerPublishBtn"]';
const CONTENT_EDITABLE_SELECTOR = 'div.ProseMirror';
const LINK_BUTTON_SELECTOR = '[data-testid="addLinkCardBtn"]';
const BUTTON_ROW_SELECTOR = 'div[tabindex] > div:nth-child(3)';
const PHOTO_BUTTON_SELECTOR = `div[tabIndex='${LAST_TAB_INDEX}']`;

export const getComposePostModal = (modalContainer) => modalContainer.querySelector(COMPOSE_POST_SELECTOR);
export const getExitButton = (modal) => modal.querySelector(COMPOSE_CANCEL_BUTTON_SELECTOR);
export const getPostButton = (modal) => modal.querySelector(COMPOSE_POST_BUTTON_SELECTOR);
export const getContentEditable = (modal) => modal.querySelector(CONTENT_EDITABLE_SELECTOR);
export const getLinkButton = (modal) => modal.querySelector(LINK_BUTTON_SELECTOR);
export const getButtonRow = (modal) => modal.querySelector(BUTTON_ROW_SELECTOR);
export const getPhotoButton = (buttonRow) => buttonRow.querySelector(PHOTO_BUTTON_SELECTOR);
