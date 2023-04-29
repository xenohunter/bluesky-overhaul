import '@webcomponents/custom-elements';
import {getSettingsManager} from './browser/settingsManager';
import {ultimatelyFind} from './dom/utils';
import {ROOT_CONTAINER, FEED_CONTAINER, MODAL_CONTAINER, COMPOSE_MODAL} from './dom/selectors';
import {KeydownWatcher} from './watchers/keydown';
import {YoutubeWatcher} from './watchers/youtube';
import {PostModalPipeline} from './pipelines/postModal';
import {EmojiPipeline} from './pipelines/emoji';
import {QuotePostPipeline} from './pipelines/quotePost';
import {log} from './utils/logger';
import {PipelineManager} from './utils/pipelineManager';

const REPO_LINK = 'https://github.com/xenohunter/bluesky-overhaul';

const run = (): Promise<void> => {
  return ultimatelyFind(document.body, ROOT_CONTAINER).then((rootContainer) => Promise.all([
    getSettingsManager(),
    Promise.resolve(rootContainer),
    ultimatelyFind(rootContainer, FEED_CONTAINER),
    ultimatelyFind(rootContainer, MODAL_CONTAINER)
  ]).then(([settingsManager, rootContainer, feedContainer, modalContainer]) => {
    const keydownWatcher = new KeydownWatcher(rootContainer, feedContainer);
    settingsManager.subscribe(keydownWatcher);
    keydownWatcher.watch();

    const youtubeWatcher = new YoutubeWatcher(feedContainer);
    youtubeWatcher.watch();

    const postModalPipeline = new PostModalPipeline(() => keydownWatcher.pause(), () => keydownWatcher.start());
    const emojiPipeline = new EmojiPipeline(() => postModalPipeline.pause(), () => postModalPipeline.start());
    const quotePostPipeline = new QuotePostPipeline();

    const pipelineManager = new PipelineManager({
      compose: [postModalPipeline, emojiPipeline, quotePostPipeline]
    });

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.target === modalContainer) {
          const composePostModal = modalContainer.querySelector(COMPOSE_MODAL.selector) as HTMLElement | null;
          if (composePostModal !== null) {
            pipelineManager.terminateExcept('compose');
            pipelineManager.deploy('compose', composePostModal);
          } else {
            pipelineManager.terminateAll();
          }
        }
      });
    });

    observer.observe(modalContainer, {childList: true, subtree: true});
  }));
};

run().then(() => {
  log('Launched');
}).catch(() => {
  setTimeout(() => {
    run().then(() => {
      log('Launched after the second attempt (1000ms delay)');
    }).catch((e) => {
      console.error(`Failed to launch Bluesky Overhaul. Please, copy the error and report this issue: ${REPO_LINK}`);
      console.error(e);
    });
  }, 1000);
});
