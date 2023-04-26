export const typeText = (text: string) => document.execCommand('insertText', false, text);
export const backspace = () => document.execCommand('delete', false, undefined);
