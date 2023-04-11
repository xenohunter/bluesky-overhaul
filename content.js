import '@webcomponents/custom-elements';
import { EmojiPipeline } from './emoji.js';

const MODAL_CONTAINER_SELECTOR = '#root > div > div > div:nth-child(6)';

const modalContainer = document.querySelector(MODAL_CONTAINER_SELECTOR);

const emojiPipeline = new EmojiPipeline();
const pipelines = [emojiPipeline];

const observer = new MutationObserver(mutations => {
  mutations.forEach(mutation => {
    if (mutation.target === modalContainer) {
      if (EmojiPipeline.isEligible(modalContainer)) {
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
