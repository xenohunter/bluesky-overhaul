import '@webcomponents/custom-elements';
import {getModalContainer, getComposePostModal} from './elementsFinder';
import {EmojiPipeline} from './emoji';


const modalContainer = getModalContainer();

const emojiPipeline = new EmojiPipeline();
const pipelines = [emojiPipeline];

const observer = new MutationObserver(mutations => {
  mutations.forEach(mutation => {
    if (mutation.target === modalContainer) {
      const composePostModal = getComposePostModal(modalContainer);
      if (composePostModal !== null) {
        emojiPipeline.deploy(modalContainer);
      } else {
        for (const pipeline of pipelines) {
          pipeline.terminate();
        }
      }
    }
  });
});

observer.observe(modalContainer, { childList: true, subtree: true });
