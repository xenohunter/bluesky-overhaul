import {IPausable} from '../../interfaces';
import {TSelectorLike, ultimatelyFindAll} from '../../dom/utils';
import {LAST_CHILD, POST_ITEMS} from '../../dom/selectors';
import {Selector} from '../../dom/selector';
import {EventKeeper} from '../../utils/eventKeeper';

const LAG = 50;

const FOLLOWING_DATA = 'homeScreenFeedTabs-Following';
const WHATSHOT_DATA = 'homeScreenFeedTabs-What\'s hot';

const TAB_BUTTONS = new Selector('[data-testid="homeScreenFeedTabs"]', {exhaustAfter: LAG});
const FOLLOWING_FEED = new Selector('[data-testid="followingFeedPage"]');
const WHATSHOT_FEED = new Selector('[data-testid="whatshotFeedPage"]');

const getNextPost = (post: HTMLElement): HTMLElement | null => {
  if (post.nextSibling) {
    return post.nextSibling as HTMLElement;
  } else {
    const parent = post.parentElement;
    if (parent && parent.nextSibling) {
      return parent.nextSibling.firstChild as HTMLElement;
    } else {
      return null;
    }
  }
};

const getPreviousPost = (post: HTMLElement): HTMLElement | null => {
  if (post.previousSibling) {
    return post.previousSibling as HTMLElement;
  } else {
    const parent = post.parentElement;
    if (parent && parent.previousSibling) {
      return parent.previousSibling.lastChild as HTMLElement;
    } else {
      return null;
    }
  }
};

export class PostList implements IPausable {
  readonly #container: HTMLElement;
  readonly #mutationObserver: MutationObserver;
  readonly #tabButtonEventKeeper = new EventKeeper();
  #activeTabSelector: Selector = FOLLOWING_FEED;
  #currentPost: HTMLElement | null = null;
  #isPaused: boolean;

  constructor(targetContainer: HTMLElement, startPaused = true) {
    this.#container = targetContainer;
    this.#mutationObserver = new MutationObserver(this.#onContainerMutation.bind(this));
    this.#isPaused = startPaused;
    if (!startPaused) this.start();
  }

  start(): void {
    this.#isPaused = false;
  }

  pause(): void {
    this.#isPaused = true;
  }

  setCurrentPost(element: HTMLElement): Promise<HTMLElement> {
    return this.#resolveList().then((posts) => {
      for (const post of posts) {
        if (post === element || post.parentElement === element || post.contains(element)) {
          this.#currentPost = post;
          return this.#currentPost;
        }
      }

      return Promise.reject('Element is not a post');
    });
  }

  getNextPost(): Promise<HTMLElement> {
    return this.#getNeighborPost(getNextPost);
  }

  getPreviousPost(): Promise<HTMLElement> {
    return this.#getNeighborPost(getPreviousPost);
  }

  #getNeighborPost(retrieveFn: (post: HTMLElement) => HTMLElement | null): Promise<HTMLElement> {
    if (this.#isPaused) return Promise.reject('PostList is paused');

    return this.#resolveList().then((posts) => {
      if (posts.length === 0) {
        return Promise.reject('No posts found');
      } else if (this.#currentPost) {
        const neighborPost = retrieveFn(this.#currentPost);
        if (neighborPost && posts.includes(neighborPost)) {
          this.#currentPost = neighborPost;
        } else if (!posts.includes(this.#currentPost)) {
          this.#currentPost = posts[0];
        }
      } else {
        this.#currentPost = posts[0];
      }

      return this.#currentPost;
    });
  }

  #isMainPage(): Promise<boolean> {
    return this.#findElements([TAB_BUTTONS]).then((tabButtonsList) => {
      if (tabButtonsList.length !== 1) throw new Error('There should be exactly one tab button container');
      this.#subscribeToTabButtons(tabButtonsList[0]);
      return true;
    }).catch(() => false);
  }

  #resolveList(): Promise<HTMLElement[]> {
    return this.#isMainPage().then((isMainPage) => {
      const prefixingSelectors = isMainPage ? [this.#activeTabSelector] : [];
      return this.#findElements([...prefixingSelectors, POST_ITEMS]).then((posts) => {
        if (posts.length === 0) {
          return Promise.reject('No posts found');
        } else {
          return posts;
        }
      });
    });
  }

  #subscribeToTabButtons(tabButtons: HTMLElement): void {
    this.#tabButtonEventKeeper.cancelAll();
    this.#tabButtonEventKeeper.add(tabButtons, 'click', this.#onTabButtonClick.bind(this));
  }

  #onContainerMutation(mutations: MutationRecord[]): void {
    mutations.forEach((mutation) => {
      if (mutation.target === this.#container) {
        this.#currentPost = null;
      }
    });
  }

  #onTabButtonClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    const data = target.getAttribute('data-testid');
    if (data === FOLLOWING_DATA || target.querySelector(`[data-testid="${FOLLOWING_DATA}"]`)) {
      if (this.#activeTabSelector !== FOLLOWING_FEED) this.#currentPost = null;
      this.#activeTabSelector = FOLLOWING_FEED;
    } else if (data === WHATSHOT_DATA || target.querySelector(`[data-testid="${WHATSHOT_DATA}"]`)) {
      if (this.#activeTabSelector !== WHATSHOT_FEED) this.#currentPost = null;
      this.#activeTabSelector = WHATSHOT_FEED;
    }
  }

  #findElements(selectors: TSelectorLike[]): Promise<HTMLElement[]> {
    return ultimatelyFindAll(this.#container, [LAST_CHILD, ...selectors]);
  }
}
