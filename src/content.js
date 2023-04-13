import '@webcomponents/custom-elements';
import {getModalContainer, getComposePostModal} from './utils/elementsFinder';
import {PostModalPipeline} from './pipelines/postModal';
import {EmojiPipeline} from './pipelines/emoji';
import {QuotePostPipeline} from './pipelines/quotePost';

const modalContainer = getModalContainer();

const postModalPipeline = new PostModalPipeline();
const pauseExitModal = postModalPipeline.pauseExit.bind(postModalPipeline);
const resumeExitModal = postModalPipeline.resumeExit.bind(postModalPipeline);

const emojiPipeline = new EmojiPipeline(pauseExitModal, resumeExitModal);
const quotePostPipeline = new QuotePostPipeline();
const pipelines = [postModalPipeline, emojiPipeline, quotePostPipeline];

const observer = new MutationObserver(mutations => {
  mutations.forEach(mutation => {
    if (mutation.target === modalContainer) {
      const composePostModal = getComposePostModal(modalContainer);
      if (composePostModal !== null) {
        emojiPipeline.deploy(modalContainer);
        quotePostPipeline.deploy(modalContainer);
        postModalPipeline.deploy(modalContainer);
      } else {
        for (const pipeline of pipelines) {
          pipeline.terminate();
        }
      }
    }
  });
});

observer.observe(modalContainer, {childList: true, subtree: true});
