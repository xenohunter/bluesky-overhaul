import {FIRST_CHILD_MARKER, LAST_CHILD_MARKER} from './constants';
import {Selector} from './selector';
import {SelectorGroup} from './selectorGroup';

// TODO : remake Selector and SelectorGroup in such a way they could support relative chaining

export const FIRST_CHILD = new Selector(FIRST_CHILD_MARKER);
export const LAST_CHILD = new Selector(LAST_CHILD_MARKER);

export const ROOT_CONTAINER = new Selector('#root > div > div');
export const FEED_CONTAINER = [FIRST_CHILD, FIRST_CHILD, FIRST_CHILD]; // relative to ROOT_CONTAINER
export const MODAL_CONTAINER = LAST_CHILD; // relative to ROOT_CONTAINER

export const COMPOSE_MODAL = new Selector('[data-testid="composePostView"]'); // relative to MODAL_CONTAINER

// All the following are relative to COMPOSE_MODAL
export const COMPOSE_CANCEL_BUTTON = new Selector('[data-testid="composerCancelButton"]');
export const COMPOSE_CONTENT_EDITABLE = new Selector('div.ProseMirror');
export const COMPOSE_LINK_CARD_BUTTON = new Selector('[data-testid="addLinkCardBtn"]');
export const COMPOSE_POST_BUTTON = new Selector('[data-testid="composerPublishBtn"]');
export const COMPOSE_BUTTON_ROW = new Selector('div[tabindex] > div:nth-child(3)');
export const COMPOSE_PHOTO_BUTTON = new Selector('div[tabIndex="0"]');

export const POST_ITEM_LINK_INJECTED_MARKER = 'bluesky-overhaul-youtube-injected'; // TODO : move to constants.ts

export const POST_ITEMS = new SelectorGroup([
  new Selector('[data-testid^="postThreadItem"]', {exhaustAfter: 5000}),
  new Selector('[data-testid^="feedItem"]', {exhaustAfter: 5000})
]);

// relative to POST_ITEMS
export const POST_ITEM_LINKS = new SelectorGroup([
  new Selector(`a[href*="youtu.be/"]:not([${POST_ITEM_LINK_INJECTED_MARKER}])`),
  new Selector(`a[href*="youtube.com/watch"]:not([${POST_ITEM_LINK_INJECTED_MARKER}])`)
]);
