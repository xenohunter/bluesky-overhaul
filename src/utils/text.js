export const typeText = (text) => document.execCommand('insertText', false, text);
export const backspace = () => document.execCommand('delete', false, null);
