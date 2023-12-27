import '@webcomponents/custom-elements';
import { APP_SETTINGS } from '../shared/appSettings';
import { initializeSentry } from '../shared/sentry';
import { BLUESKY_OVERHAUL_VERSION } from '../shared/version';
import { getSettingsManager } from './browser/settingsManager';
import { ultimatelyFind } from './dom/utils';
import { ROOT_CONTAINER, FEED_CONTAINER, MODAL_CONTAINER, COMPOSE_MODAL } from './dom/selectors';
import { CountersConcealer } from './watchers/countersConcealer';
import { KeydownWatcher } from './watchers/keydown';
import { PostDatetimeWatcher } from './watchers/postDatetime';
import { YoutubeWatcher } from './watchers/youtube';
import { PostModalPipeline } from './pipelines/postModal';
import { QuotePostPipeline } from './pipelines/quotePost';
import { log } from './utils/logger';
import { PipelineManager } from './utils/pipelineManager';

const REPO_LINK = 'https://github.com/xenohunter/bluesky-overhaul';
const EXTENSION_DISABLED_CODE = 'EXTENSION_DISABLED';

initializeSentry('content');

const run = async (): Promise<void> => {
  const settingsManager = await getSettingsManager();
  if (settingsManager.get(APP_SETTINGS.BLUESKY_OVERHAUL_ENABLED) === false) {
    return Promise.reject(EXTENSION_DISABLED_CODE);
  }

  return ultimatelyFind(document.body, ROOT_CONTAINER).then((rootContainer) => Promise.all([
    Promise.resolve(rootContainer),
    ultimatelyFind(rootContainer, FEED_CONTAINER)
  ]).then(([rootContainer, feedContainer]) => {
    const countersConcealer = new CountersConcealer(document.body);
    settingsManager.subscribe(countersConcealer);
    countersConcealer.watch();

    const keydownWatcher = new KeydownWatcher(rootContainer, feedContainer);
    settingsManager.subscribe(keydownWatcher);
    keydownWatcher.watch();

    const postDatetimeWatcher = new PostDatetimeWatcher(feedContainer);
    settingsManager.subscribe(postDatetimeWatcher);
    postDatetimeWatcher.watch();

    const youtubeWatcher = new YoutubeWatcher(feedContainer);
    youtubeWatcher.watch();

    const postModalPipeline = new PostModalPipeline(() => keydownWatcher.pause(), () => keydownWatcher.start());
    const quotePostPipeline = new QuotePostPipeline();

    const pipelineManager = new PipelineManager({
      compose: [postModalPipeline, quotePostPipeline]
    });

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        const target = mutation.target as HTMLElement;
        if (target === rootContainer) {
          if (mutation.addedNodes.length > 0) {
            ultimatelyFind(rootContainer, MODAL_CONTAINER).then((modalContainer) => {
              const composePostModal = modalContainer.querySelector(COMPOSE_MODAL.selector) as HTMLElement | null;
              if (composePostModal !== null) {
                pipelineManager.terminateExcept('compose');
                pipelineManager.deploy('compose', composePostModal);
              }
            });
          } else if (mutation.removedNodes.length > 0) {
            pipelineManager.terminateAll();
          }
        }
      });
    });

    observer.observe(rootContainer, {childList: true});
  }));
};

run().then(() => {
  log(`Launched [${BLUESKY_OVERHAUL_VERSION}]`);
}).catch((e) => {
  if (e === EXTENSION_DISABLED_CODE) return;
  setTimeout(() => {
    run().then(() => {
      log(`Launched on the second attempt (1000ms delay) [${BLUESKY_OVERHAUL_VERSION}]`);
    }).catch((e) => {
      if (e === EXTENSION_DISABLED_CODE) return;
      console.error(`Failed to launch Bluesky Overhaul. Please, copy the error and report this issue: ${REPO_LINK}`);
      console.error(e);
    });
  }, 1000);
});
