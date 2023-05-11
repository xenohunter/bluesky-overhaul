import {TSettings} from '../types';

export enum APP_SETTINGS {
  BLUESKY_OVERHAUL_ENABLED = 'bluesky-overhaul-enabled',
  HANDLE_VIM_KEYBINDINGS = 'vim-keybindings',
  HIDE_FOLLOWERS_COUNT = 'hide-followers-count',
  HIDE_FOLLOWING_COUNT = 'hide-following-count',
  HIDE_POSTS_COUNT = 'hide-posts-count'
}

export const DEFAULT_SETTINGS: TSettings = {
  [APP_SETTINGS.BLUESKY_OVERHAUL_ENABLED]: true,
  [APP_SETTINGS.HANDLE_VIM_KEYBINDINGS]: false,
  [APP_SETTINGS.HIDE_FOLLOWERS_COUNT]: false,
  [APP_SETTINGS.HIDE_FOLLOWING_COUNT]: false,
  [APP_SETTINGS.HIDE_POSTS_COUNT]: false
};
