import '@webcomponents/custom-elements';
import {getModalContainer, getComposePostModal} from './elementsFinder';
import {EmojiPipeline} from './emoji';
import {QuotePostPipeline} from './quotePost';
import {ExitModalPipeline} from './exitModal';

const modalContainer = getModalContainer();

const emojiPipeline = new EmojiPipeline();
const quotePostPipeline = new QuotePostPipeline();
const exitModalPipeline = new ExitModalPipeline();
const pipelines = [emojiPipeline, quotePostPipeline, exitModalPipeline];

const observer = new MutationObserver(mutations => {
  mutations.forEach(mutation => {
    if (mutation.target === modalContainer) {
      const composePostModal = getComposePostModal(modalContainer);
      if (composePostModal !== null) {
        emojiPipeline.deploy(modalContainer);
        quotePostPipeline.deploy(modalContainer);
        exitModalPipeline.deploy(modalContainer);
      } else {
        for (const pipeline of pipelines) {
          pipeline.terminate();
        }
      }
    }
  });
});

observer.observe(modalContainer, {childList: true, subtree: true});
