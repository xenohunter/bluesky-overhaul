// This code is courtesy of https://stackoverflow.com/a/62700928/1887427
// Here, it has been restructured into exported and non-exported functions

const createRange = (node: Node, chars: { count: number }, range?: Range): Range => {
  if (!range) {
    range = document.createRange();
    range.selectNode(node);
    range.setStart(node, 0);
  }

  if (chars.count === 0) {
    range.setEnd(node, chars.count);
  } else if (node && node.textContent && chars.count > 0) {
    if (node.nodeType === Node.TEXT_NODE) {
      if (node.textContent.length < chars.count) {
        chars.count -= node.textContent.length;
      } else {
        range.setEnd(node, chars.count);
        chars.count = 0;
      }
    } else {
      for (let lp = 0; lp < node.childNodes.length; lp++) {
        range = createRange(node.childNodes[lp], chars, range);
        if (chars.count === 0) break;
      }
    }
  }

  return range;
};

const isChildOf = (node: Node, parentElement: Node): boolean => {
  while (node !== null) {
    if (node === parentElement) return true;
    node = node.parentNode as Node;
  }

  return false;
};

export const getCurrentCursorPosition = (parentElement: HTMLElement): number => {
  const selection = window.getSelection();
  let charCount = -1;
  let node = null;

  if (selection && selection.focusNode) {
    if (isChildOf(selection.focusNode, parentElement)) {
      node = selection.focusNode;
      charCount = selection.focusOffset;

      while (node) {
        if (node === parentElement) break;
        if (node.previousSibling) {
          node = node.previousSibling;
          charCount += node.textContent?.length ?? 0;
        } else {
          node = node.parentNode;
          if (node === null) break;
        }
      }
    }
  }

  return charCount;
};

export const setCurrentCursorPosition = (chars: number, element: HTMLElement) => {
  if (chars >= 0) {
    const selection = window.getSelection();
    const range = createRange(element, {count: chars});

    if (selection && range) {
      range.collapse(false);
      selection.removeAllRanges();
      selection.addRange(range);
    }
  }
};
