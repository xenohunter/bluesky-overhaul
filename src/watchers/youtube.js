import {Watcher} from './watcher';
import {CallThrottler} from '../utils/callThrottler';
import {Selector, SelectorGroup, ultimatelyFindAll} from '../utils/elementsFinder';
import {noop} from '../utils/misc';

const YOUTU_BE_REGEX = /youtu\.be\/([a-zA-Z0-9_-]+)/;
const YOUTUBE_WATCH_REGEX = /youtube\.com\/watch\?v=([a-zA-Z0-9_-]+)/;

const INJECTED_MARKER = 'bluesky-overhaul-youtube-injected';

const POST_ITEMS = new SelectorGroup([
  new Selector('[data-testid^="postThreadItem"]', {exhaustAfter: 5000}),
  new Selector('[data-testid^="feedItem"]', {exhaustAfter: 5000})
]);

const POST_ITEM_LINKS = new SelectorGroup([
  new Selector(`a[href*="youtu.be/"]:not([${INJECTED_MARKER}])`),
  new Selector(`a[href*="youtube.com/watch"]:not([${INJECTED_MARKER}])`)
]);

const resolveYoutubeId = (url) => {
  if (url.includes('youtu.be')) {
    return url.match(YOUTU_BE_REGEX)[1];
  } else if (url.includes('youtube.com/watch')) {
    return url.match(YOUTUBE_WATCH_REGEX)[1];
  } else {
    return null;
  }
};

const injectYoutubePlayers = (youtubeLinks) => {
  youtubeLinks.forEach(link => {
    if (link.getAttribute(INJECTED_MARKER)) return;

    const videoId = resolveYoutubeId(link.href);
    if (!videoId) return;

    const iframe = document.createElement('iframe');
    iframe.setAttribute('src', `https://www.youtube.com/embed/${videoId}`);
    iframe.setAttribute('allow', 'accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture');
    iframe.setAttribute('allowfullscreen', 'true');
    iframe.style.width = '100%';
    iframe.style.height = '400px';
    iframe.style.border = 'none';
    iframe.style.flexGrow = '1';
    iframe.style.paddingTop = '10px';

    link.parentNode.parentNode.appendChild(iframe);
    link.setAttribute(INJECTED_MARKER, 'true');

    if (iframe.parentNode.nextSibling && iframe.parentNode.nextSibling.getAttribute('tabindex') === '0') {
      iframe.parentNode.nextSibling.style.display = 'none';
    }
  });
};

const createYoutubePlayers = (container) => {
  ultimatelyFindAll([POST_ITEMS, POST_ITEM_LINKS], container)
    .then(injectYoutubePlayers)
    .catch(noop);
};

export class YoutubeWatcher extends Watcher {
  constructor(container) {
    super();
    this.container = container;
    this.throttler = new CallThrottler(1000);
    this.observer = null;
  }

  watch() {
    this.observer = new MutationObserver(() => {
      this.throttler.call(() => createYoutubePlayers(this.container.lastChild));
    });

    this.throttler.call(() => createYoutubePlayers(this.container.lastChild));
    this.observer.observe(this.container, {childList: true, subtree: true});
  }
}
