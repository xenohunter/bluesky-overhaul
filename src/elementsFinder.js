export const LAST_NATIVE_TAB_INDEX = 0;

const MODAL_CONTAINER_SELECTOR = '#root > div > div > div:nth-child(6)';
const COMPOSE_POST_SELECTOR = '[data-testid="composePostView"]';
const BUTTON_ROW_SELECTOR = 'div[tabindex] > div:nth-child(3)';
const PHOTO_BUTTON_SELECTOR = `div[tabIndex='${LAST_NATIVE_TAB_INDEX}']`;

export const getModalContainer = () => document.querySelector(MODAL_CONTAINER_SELECTOR);
export const getComposePostModal = (modalContainer) => modalContainer.querySelector(COMPOSE_POST_SELECTOR);
export const getButtonRow = (modal) => modal.querySelector(BUTTON_ROW_SELECTOR);
export const getPhotoButton = (buttonRow) => buttonRow.querySelector(PHOTO_BUTTON_SELECTOR);
