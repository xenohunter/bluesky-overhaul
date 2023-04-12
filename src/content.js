import '@webcomponents/custom-elements';
import {getModalContainer, getComposePostModal} from './elementsFinder';
import {ExitModalPipeline} from './exitModal';
import {EmojiPipeline} from './emoji';
import {QuotePostPipeline} from './quotePost';

const modalContainer = getModalContainer();

const exitModalPipeline = new ExitModalPipeline();
const pauseExitModal = exitModalPipeline.pause.bind(exitModalPipeline);
const resumeExitModal = exitModalPipeline.resume.bind(exitModalPipeline);

const emojiPipeline = new EmojiPipeline(pauseExitModal, resumeExitModal);
const quotePostPipeline = new QuotePostPipeline();
const pipelines = [exitModalPipeline, emojiPipeline, quotePostPipeline];

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
