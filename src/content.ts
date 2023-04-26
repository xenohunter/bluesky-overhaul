import '@webcomponents/custom-elements';
import {ultimatelyFind} from './dom/utils';
import {ROOT_CONTAINER, FEED_CONTAINER, MODAL_CONTAINER, COMPOSE_MODAL} from './dom/selectors';
import {ArrowKeydownWatcher} from './watchers/arrowKeydown';
import {YoutubeWatcher} from './watchers/youtube';
import {PostModalPipeline} from './pipelines/postModal';
import {EmojiPipeline} from './pipelines/emoji';
import {QuotePostPipeline} from './pipelines/quotePost';
import {log} from './utils/logger';
import {PipelineManager} from './utils/pipelineManager';

const REPO_LINK = 'https://github.com/xenohunter/bluesky-overhaul';

const run = () => {
  return ultimatelyFind(document.body, ROOT_CONTAINER).then((rootContainer) => Promise.all([
    Promise.resolve(rootContainer),
    ultimatelyFind(rootContainer, FEED_CONTAINER),
    ultimatelyFind(rootContainer, MODAL_CONTAINER)
  ]).then(([rootContainer, feedContainer, modalContainer]) => {
    const arrowKeydownWatcher = new ArrowKeydownWatcher(rootContainer);
    arrowKeydownWatcher.watch();

    const youtubeWatcher = new YoutubeWatcher(feedContainer);
    youtubeWatcher.watch();

    const postModalPipeline = new PostModalPipeline();
    const pauseExitModal = postModalPipeline.pause.bind(postModalPipeline);
    const resumeExitModal = postModalPipeline.resume.bind(postModalPipeline);

    const emojiPipeline = new EmojiPipeline(pauseExitModal, resumeExitModal);
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

const launch = () => {
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
};

launch();
