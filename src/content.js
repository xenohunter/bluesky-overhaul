import '@webcomponents/custom-elements';
import {getRootContainer, getModalContainer, getComposePostModal} from './utils/elementsFinder';
import {ArrowKeydownPipeline} from './pipelines/arrowKeydown';
import {PostModalPipeline} from './pipelines/postModal';
import {EmojiPipeline} from './pipelines/emoji';
import {QuotePostPipeline} from './pipelines/quotePost';

setTimeout(() => {
  const rootContainer = getRootContainer();
  const modalContainer = getModalContainer(rootContainer);

  const arrowKeydownPipeline = new ArrowKeydownPipeline();
  arrowKeydownPipeline.deploy(rootContainer);

  const postModalPipeline = new PostModalPipeline();
  const pauseExitModal = postModalPipeline.pauseExit.bind(postModalPipeline);
  const resumeExitModal = postModalPipeline.resumeExit.bind(postModalPipeline);

  const emojiPipeline = new EmojiPipeline(pauseExitModal, resumeExitModal);
  const quotePostPipeline = new QuotePostPipeline();

  const pipelines = {
    compose: [postModalPipeline, emojiPipeline, quotePostPipeline]
  };

  const deployPipelines = (type, target = {}) => pipelines[type].forEach(pipeline => pipeline.deploy(target, type));
  const terminatePipelines = (type) => pipelines[type].forEach(pipeline => pipeline.terminate());
  const terminatePipelinesAll = () => Object.keys(pipelines).forEach(terminatePipelines);
  const terminatePipelinesExcept = (type) => Object.keys(pipelines).filter(t => t !== type).forEach(terminatePipelines);

  const observer = new MutationObserver(mutations => {
    mutations.forEach(mutation => {
      if (mutation.target === modalContainer) {
        const composePostModal = getComposePostModal(modalContainer);
        if (composePostModal !== null) {
          terminatePipelinesExcept('compose');
          deployPipelines('compose', composePostModal);
        } else {
          terminatePipelinesAll();
        }
      }
    });
  });

  observer.observe(modalContainer, {childList: true, subtree: true});
}, 0);
