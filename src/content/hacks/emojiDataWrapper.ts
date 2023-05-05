import * as data from '@emoji-mart/data';

// This is done to make `data.categories` amenable to being rewritten by the emoji-mart library
export const emojiData = { ...data };
