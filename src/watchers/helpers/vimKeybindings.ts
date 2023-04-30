import {IPausable} from '../../interfaces';
import {ROOT_CONTAINER, SEARCH_BAR} from '../../dom/selectors';
import {EventKeeper} from '../../utils/eventKeeper';
import {noop} from '../../utils/misc';
import {modal, tip} from '../../utils/notifications';
import {PostList} from './postList';
import {generateHelpMessage, VIM_ACTIONS, VIM_KEY_MAP} from './vimActions';
import {ultimatelyFind} from '../../dom/utils';

enum DIRECTION { NEXT, PREVIOUS }

const FOCUSED_POST_CLASS = 'bluesky-overhaul-focused-post';
const MISSING_POST_ERROR = 'No post is focused';

const REPLY_BUTTON_SELECTOR = '[data-testid="replyBtn"]';
const REPOST_BUTTON_SELECTOR = '[data-testid="repostBtn"]';
const LIKE_BUTTON_SELECTOR = '[data-testid="likeBtn"]';

export class VimKeybindingsHandler implements IPausable {
  readonly #container: HTMLElement;
  readonly #postList: PostList;
  readonly #postClickEventKeeper = new EventKeeper();
  readonly #searchBarEventKeeper = new EventKeeper();
  #currentPost: HTMLElement | null = null;
  #stashedPost: HTMLElement | null = null;
  #isPaused: boolean;

  constructor(targetContainer: HTMLElement, startPaused = true) {
    this.#container = targetContainer;
    this.#postList = new PostList(targetContainer, startPaused);
    this.#isPaused = startPaused;
  }

  start(): void {
    if (!this.#isPaused) return;
    this.#postList.start();
    this.#postClickEventKeeper.add(this.#container, 'click', this.#onPostAltClick.bind(this));
    this.#blurSearchBar();
    this.#isPaused = false;
  }

  pause(): void {
    if (this.#isPaused) return;
    this.#postList.pause();
    this.#postClickEventKeeper.cancelAll();
    this.#searchBarEventKeeper.cancelAll();
    this.#removeHighlight();
    this.#isPaused = true;
  }

  handle(event: KeyboardEvent): void {
    if (this.#isPaused) return;
    event.preventDefault();

    const key = event.key;
    if (!(key in VIM_KEY_MAP)) return;

    const action = VIM_KEY_MAP[key as keyof typeof VIM_KEY_MAP];
    switch (action) {
    case VIM_ACTIONS.SHOW_HELP:
      modal(generateHelpMessage());
      break;
    case VIM_ACTIONS.SEARCH:
      this.#focusSearchBar();
      break;
    case VIM_ACTIONS.LOAD_NEW_POSTS:
      this.#loadNewPosts();
      break;
    case VIM_ACTIONS.NEXT_POST:
      this.#selectPost(DIRECTION.NEXT);
      break;
    case VIM_ACTIONS.PREVIOUS_POST:
      this.#selectPost(DIRECTION.PREVIOUS);
      break;
    case VIM_ACTIONS.LIKE:
      this.#likePost();
      break;
    case VIM_ACTIONS.CREATE_POST:
      this.#newPost();
      break;
    case VIM_ACTIONS.EXPAND_IMAGE:
      this.#expandImage();
      break;
    case VIM_ACTIONS.REPLY:
      this.#replyToPost();
      break;
    case VIM_ACTIONS.REPOST:
      this.#repostPost();
      break;
    case VIM_ACTIONS.OPEN_POST:
      this.#currentPost?.click();
      break;
    default:
      tip(`Action "${action}" is not implemented yet`);
    }
  }

  #selectPost(direction: DIRECTION): void {
    if (direction === DIRECTION.NEXT) {
      this.#postList.getNextPost().then((p) => this.#highlightPost(p));
    } else {
      this.#postList.getPreviousPost().then((p) => this.#highlightPost(p));
    }
  }

  #replyToPost(): void {
    if (!this.#currentPost) return tip(MISSING_POST_ERROR);
    const reply = this.#currentPost.querySelector(REPLY_BUTTON_SELECTOR) as HTMLElement;
    reply?.click();
  }

  #repostPost(): void {
    if (!this.#currentPost) return tip(MISSING_POST_ERROR);
    const repost = this.#currentPost.querySelector(REPOST_BUTTON_SELECTOR) as HTMLElement;
    repost?.click();
  }

  #likePost(): void {
    if (!this.#currentPost) return tip(MISSING_POST_ERROR);
    const like = this.#currentPost.querySelector(LIKE_BUTTON_SELECTOR) as HTMLElement;
    like?.click();
  }

  #expandImage(): void {
    if (!this.#currentPost) return tip(MISSING_POST_ERROR);
    const imageContainer = this.#currentPost.querySelector('div.expo-image-container') as HTMLElement;
    imageContainer?.click();
  }

  #onPostAltClick(event: MouseEvent): void {
    if (this.#isPaused || !event.altKey) return;
    event.preventDefault();

    this.#postList.setCurrentPost(event.target as HTMLElement).then((p) => this.#highlightPost(p)).catch(noop);
  }

  #highlightPost(post: HTMLElement): void {
    if (post === this.#currentPost) return;
    this.#removeHighlight();

    this.#stashedPost = null;
    this.#currentPost = post;
    this.#currentPost.classList.add(FOCUSED_POST_CLASS);
    this.#currentPost.scrollIntoView({block: 'center', behavior: 'smooth'});
    this.#currentPost.focus({preventScroll: true});
  }

  #removeHighlight(): void {
    this.#stashedPost = this.#currentPost;
    this.#currentPost?.classList.remove(FOCUSED_POST_CLASS);
    this.#currentPost = null;
  }

  #focusSearchBar(): void {
    this.#removeHighlight();
    this.#findSearchBar().then((searchBar) => {
      this.#searchBarEventKeeper.cancelAll();
      searchBar.focus();
      this.#searchBarEventKeeper.add(searchBar, 'blur', this.#blurSearchBar.bind(this));
      this.#searchBarEventKeeper.add(searchBar, 'keydown', (event: KeyboardEvent) => {
        if (event.key === 'Escape') searchBar.blur();
      });
    }).catch(() => tip('Search bar not found'));
  }

  #blurSearchBar(): void {
    this.#searchBarEventKeeper.cancelAll();
    this.#findSearchBar().then((searchBar) => {
      searchBar.blur();
      this.#stashedPost && this.#highlightPost(this.#stashedPost);
      this.#searchBarEventKeeper.add(searchBar, 'focus', this.#focusSearchBar.bind(this));
    });
  }

  #findSearchBar(): Promise<HTMLElement> {
    return ultimatelyFind(document.body, SEARCH_BAR);
  }

  async #loadNewPosts(): Promise<void> {
    try {
      const tab = await this.#postList.getCurrentFeedTab();
      const tabContainer = await ultimatelyFind(this.#container, tab);
      const newPostsButton = tabContainer.childNodes[1] as HTMLElement;

      if (newPostsButton && newPostsButton.nextSibling) {
        newPostsButton.click();
        this.#container.scrollIntoView({block: 'start', behavior: 'smooth'});
      } else {
        tip('No new posts to load');
      }
    } catch {
      tip('You are not on the feed page');
    }
  }

  async #newPost(): Promise<void> {
    const rootContainer = await ultimatelyFind(document.body, ROOT_CONTAINER);
    const children = rootContainer.childNodes;
    const menuItems = children[1].childNodes;
    const newPostButton = menuItems[menuItems.length - 1] as HTMLElement;

    if (newPostButton) {
      newPostButton.click();
    } else {
      tip('No new post button found');
    }
  }
}
