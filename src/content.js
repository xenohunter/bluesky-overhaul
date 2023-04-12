import '@webcomponents/custom-elements';
import {getModalContainer, getComposePostModal} from './elementsFinder';
import {EmojiPipeline} from './emoji';
import {QuotePostPipeline} from './quotePost';


const modalContainer = getModalContainer();

const emojiPipeline = new EmojiPipeline();
const quotePostPipeline = new QuotePostPipeline();
const pipelines = [emojiPipeline, quotePostPipeline];

const observer = new MutationObserver(mutations => {
  mutations.forEach(mutation => {
    if (mutation.target === modalContainer) {
      const composePostModal = getComposePostModal(modalContainer);
      if (composePostModal !== null) {
        emojiPipeline.deploy(modalContainer);
        quotePostPipeline.deploy(modalContainer);
      } else {
        for (const pipeline of pipelines) {
          pipeline.terminate();
        }
      }
    }
  });
});

observer.observe(modalContainer, { childList: true, subtree: true });
