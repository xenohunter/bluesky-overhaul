import '@webcomponents/custom-elements';
import {getModalContainer, getComposePostModal} from './utils/elementsFinder';
import {PostModalPipeline} from './pipelines/postModal';
import {EmojiPipeline} from './pipelines/emoji';
import {QuotePostPipeline} from './pipelines/quotePost';

setTimeout(() => {
  const modalContainer = getModalContainer();

  const postModalPipeline = new PostModalPipeline();
  const pauseExitModal = postModalPipeline.pauseExit.bind(postModalPipeline);
  const resumeExitModal = postModalPipeline.resumeExit.bind(postModalPipeline);

  const emojiPipeline = new EmojiPipeline(pauseExitModal, resumeExitModal);
  const quotePostPipeline = new QuotePostPipeline();

  const composePostPipelines = [postModalPipeline, emojiPipeline, quotePostPipeline];

  const observer = new MutationObserver(mutations => {
    mutations.forEach(mutation => {
      if (mutation.target === modalContainer) {
        const composePostModal = getComposePostModal(modalContainer);
        if (composePostModal !== null) {
          for (const pipeline of composePostPipelines) {
            pipeline.deploy(composePostModal, modalType = 'compose');
          }
        } else {
          for (const pipeline of composePostPipelines) {
            pipeline.terminate();
          }
        }
      }
    });
  });

  observer.observe(modalContainer, {childList: true, subtree: true});
}, 0);
