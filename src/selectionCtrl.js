export class SelectionController {
  // Courtesy of https://stackoverflow.com/a/62700928/1887427 + some cosmetic fixes (const, let, etc)

  static getCurrentCursorPosition(parentElement) {
    const selection = window.getSelection();
    let charCount = -1;
    let node = null;

    if (selection.focusNode) {
      if (SelectionController._isChildOf(selection.focusNode, parentElement)) {
        node = selection.focusNode;
        charCount = selection.focusOffset;

        while (node) {
          if (node === parentElement) break;
          if (node.previousSibling) {
            node = node.previousSibling;
            charCount += node.textContent.length;
          } else {
            node = node.parentNode;
            if (node === null) break;
          }
        }
      }
    }

    return charCount;
  }

  static setCurrentCursorPosition(chars, element) {
    if (chars >= 0) {
      const selection = window.getSelection();
      const range = SelectionController._createRange(element, {count: chars});

      if (range) {
        range.collapse(false);
        selection.removeAllRanges();
        selection.addRange(range);
      }
    }
  }

  static _createRange(node, chars, range) {
    if (!range) {
      range = document.createRange()
      range.selectNode(node);
      range.setStart(node, 0);
    }

    if (chars.count === 0) {
      range.setEnd(node, chars.count);
    } else if (node && chars.count > 0) {
      if (node.nodeType === Node.TEXT_NODE) {
        if (node.textContent.length < chars.count) {
          chars.count -= node.textContent.length;
        } else {
          range.setEnd(node, chars.count);
          chars.count = 0;
        }
      } else {
        for (let lp = 0; lp < node.childNodes.length; lp++) {
          range = SelectionController._createRange(node.childNodes[lp], chars, range);
          if (chars.count === 0) break;
        }
      }
    }

    return range;
  }

  static _isChildOf(node, parentElement) {
    while (node !== null) {
      if (node === parentElement) return true;
      node = node.parentNode;
    }

    return false;
  }
}
