const SVG_ARROW_SELECTOR = 'svg[viewBox="0 0 256 512"][height="40"][width="40"]';
const MODAL_IMAGE_SELECTOR = 'img[alt][draggable="false"]';

const getElementPositionX = (elem) => {
  const rect = elem.getBoundingClientRect();
  return rect.left + rect.width / 2;
};

const locateArrows = () => {
  const svgElements = document.querySelectorAll(SVG_ARROW_SELECTOR);
  const sideArrows = Array.from(svgElements).map((svg) => svg.parentElement);
  const windowCenter = window.innerWidth / 2;

  let leftArrow = null;
  let rightArrow = null;

  if (sideArrows.length === 1) {
    if (getElementPositionX(sideArrows[0]) < windowCenter) {
      leftArrow = sideArrows[0];
    } else {
      rightArrow = sideArrows[0];
    }
  } else if (sideArrows.length === 2) {
    [leftArrow, rightArrow] = sideArrows;
  }

  return [leftArrow, rightArrow];
};

export class ArrowKeydownPipeline {
  constructor() {
    this.container = null;
  }

  deploy(rootContainer) {
    if (this.container !== null) return;

    this.container = rootContainer;
    this.callback = this.onKeydown.bind(this);

    document.addEventListener('keydown', this.callback);
  }

  terminate() {
    if (this.container === null) return;
    document.removeEventListener('keydown', this.callback);
    this.modal = this.callback = null;
  }

  onKeydown(event) {
    if (['ArrowLeft', 'ArrowRight', 'Escape'].indexOf(event.key) === -1) return;

    const [leftArrow, rightArrow] = locateArrows();

    if (event.key === 'ArrowLeft' && leftArrow !== null) {
      leftArrow.click();
    } else if (event.key === 'ArrowRight' && rightArrow !== null) {
      rightArrow.click();
    } else if (event.key === 'Escape') {
      const photoModal = this.container.lastChild?.firstChild;
      const photoModalImage = photoModal?.firstChild.querySelector(MODAL_IMAGE_SELECTOR);
      if (photoModalImage && photoModalImage.parentElement.getAttribute('data-testid') !== 'userAvatarImage') {
        photoModal.click();
      }
    }
  }
}
