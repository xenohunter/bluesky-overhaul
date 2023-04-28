import {Selector} from './selector';
import {SelectorGroup} from './selectorGroup';

type TSelectorLike = Selector | SelectorGroup;
type TSelectorOrArray = TSelectorLike | TSelectorLike[];

const findInElements = (selector: TSelectorLike, elements: HTMLElement[]): Promise<HTMLElement[]> => {
  return new Promise((resolve, reject) => {
    const firstAttemptResult = selector.retrieveFrom(elements);
    if (firstAttemptResult.length > 0) {
      resolve(firstAttemptResult);
    } else {
      const observer = new MutationObserver(() => {
        const foundElements = selector.retrieveFrom(elements);
        if (foundElements.length > 0) {
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

export const ultimatelyFindAll = (rootElement: HTMLElement, selectors: TSelectorOrArray): Promise<HTMLElement[]> => {
  if (!(selectors instanceof Array)) selectors = [selectors];

  return selectors.reduce(async (previousPromise, selector): Promise<HTMLElement[]> => {
    const foundElements = await previousPromise;
    return findInElements(selector, foundElements);
  }, Promise.resolve([rootElement]));
};

export const ultimatelyFind = (rootElement: HTMLElement, selectors: TSelectorOrArray): Promise<HTMLElement> => {
  return ultimatelyFindAll(rootElement, selectors).then((foundElements) => foundElements?.[0] ?? null);
};
