import '@webcomponents/custom-elements';
import {ArrowKeydownPipeline} from './pipelines/arrowKeydown';
import {PostModalPipeline} from './pipelines/postModal';
import {EmojiPipeline} from './pipelines/emoji';
import {QuotePostPipeline} from './pipelines/quotePost';
import {getRootContainer, getModalContainer, getComposePostModal} from './utils/elementsFinder';
import {log} from './utils/logger';
import {PipelineManager} from './utils/pipelineManager';

const REPO_LINK = 'https://github.com/xenohunter/bluesky-overhaul';

const run = () => {
  const rootContainer = getRootContainer();
  const modalContainer = getModalContainer(rootContainer);

  // TODO : make a different abstraction for this (e.g. Watcher instead of Pipeline)
  const arrowKeydownPipeline = new ArrowKeydownPipeline();
  arrowKeydownPipeline.deploy(rootContainer);

  const postModalPipeline = new PostModalPipeline();
  const pauseExitModal = postModalPipeline.pauseExit.bind(postModalPipeline);
  const resumeExitModal = postModalPipeline.resumeExit.bind(postModalPipeline);

  const emojiPipeline = new EmojiPipeline(pauseExitModal, resumeExitModal);
  const quotePostPipeline = new QuotePostPipeline();

  const pipelineManager = new PipelineManager({
    compose: [postModalPipeline, emojiPipeline, quotePostPipeline]
  });

  const observer = new MutationObserver(mutations => {
    mutations.forEach(mutation => {
      if (mutation.target === modalContainer) {
        const composePostModal = getComposePostModal(modalContainer);
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
};

const launch = () => {
  log('Launching...');
  try {
    run();
  } catch (e) {
    setTimeout(() => {
      try {
        run();
      } catch (e) {
        console.error(`Failed to launch Bluesky Overhaul. Please, copy the error and report this issue: ${REPO_LINK}`);
        console.error(e);
      }
    }, 1000);
  }
};

// TODO: Find a more DOM-related way to do this (i.e. via some event)
if (window.chrome) {
  setTimeout(launch, 50);
} else {
  setTimeout(launch, 500);
}
