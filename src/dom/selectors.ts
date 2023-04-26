import {FIRST_CHILD, LAST_CHILD} from './constants';
import {Selector} from './selector';
import {SelectorGroup} from './selectorGroup';

export const ROOT_CONTAINER = new Selector('#root > div > div');
export const FEED_CONTAINER = Selector.fromArray([FIRST_CHILD, FIRST_CHILD, FIRST_CHILD]);
export const MODAL_CONTAINER = new Selector(LAST_CHILD);

export const COMPOSE_MODAL = new Selector('[data-testid="composePostView"]');
export const COMPOSE_CANCEL_BUTTON = new Selector('[data-testid="composerCancelButton"]');
export const COMPOSE_CONTENT_EDITABLE = new Selector('div.ProseMirror');
export const COMPOSE_LINK_CARD_BUTTON = new Selector('[data-testid="addLinkCardBtn"]');
export const COMPOSE_POST_BUTTON = new Selector('[data-testid="composerPublishBtn"]');
export const COMPOSE_BUTTON_ROW = new Selector('div[tabindex] > div:nth-child(3)');
export const COMPOSE_PHOTO_BUTTON = new Selector('div[tabIndex="0"]');

export const POST_ITEM_LINK_INJECTED_MARKER = 'bluesky-overhaul-youtube-injected';

export const POST_ITEMS = new SelectorGroup([
  new Selector('[data-testid^="postThreadItem"]', {exhaustAfter: 5000}),
  new Selector('[data-testid^="feedItem"]', {exhaustAfter: 5000})
]);

export const POST_ITEM_LINKS = new SelectorGroup([
  new Selector(`a[href*="youtu.be/"]:not([${POST_ITEM_LINK_INJECTED_MARKER}])`),
  new Selector(`a[href*="youtube.com/watch"]:not([${POST_ITEM_LINK_INJECTED_MARKER}])`)
]);
