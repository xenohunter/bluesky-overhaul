import {IPausable} from '../../interfaces';
import {SEARCH_BAR} from '../../dom/selectors';
import {EventKeeper} from '../../utils/eventKeeper';
import {noop} from '../../utils/misc';
import {modal, tip} from '../../utils/notifications';
import {PostList} from './postList';
import {generateHelpMessage, VIM_ACTIONS, VIM_KEY_MAP} from './vimActions';
import {ultimatelyFind} from '../../dom/utils';

enum DIRECTION { NEXT, PREVIOUS }

const FOCUSED_POST_CLASS = 'bluesky-overhaul-focused-post';

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
    this.#isPaused = false;
  }

  pause(): void {
    if (this.#isPaused) return;
    this.#postList.pause();
    this.#postClickEventKeeper.cancelAll();
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
    case VIM_ACTIONS.NEXT_POST:
      this.#selectPost(DIRECTION.NEXT);
      break;
    case VIM_ACTIONS.OPEN_POST:
      this.#currentPost?.click();
      break;
    case VIM_ACTIONS.PREVIOUS_POST:
      this.#selectPost(DIRECTION.PREVIOUS);
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
      searchBar.focus();
      this.#searchBarEventKeeper.add(searchBar, 'blur', this.#blurSearchBar.bind(this));
      this.#searchBarEventKeeper.add(searchBar, 'keydown', (event: KeyboardEvent) => {
        if (event.key === 'Escape') this.#blurSearchBar();
      });
    });
  }

  #blurSearchBar(): void {
    this.#searchBarEventKeeper.cancelAll();
    this.#findSearchBar().then((searchBar) => {
      searchBar.blur();
      this.#stashedPost && this.#highlightPost(this.#stashedPost);
    });
  }

  #findSearchBar(): Promise<HTMLElement> {
    return ultimatelyFind(document.body, SEARCH_BAR);
  }
}
