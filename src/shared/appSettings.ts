import {TSettings} from '../types';

export enum APP_SETTINGS {
  SETTINGS_LAST_UPDATED_VERSION = 'settings-last-updated-version',
  BLUESKY_OVERHAUL_ENABLED = 'bluesky-overhaul-enabled',
  HANDLE_VIM_KEYBINDINGS = 'vim-keybindings',
  HIDE_FOLLOWERS_COUNT = 'hide-followers-count',
  HIDE_FOLLOWING_COUNT = 'hide-following-count',
  HIDE_POSTS_COUNT = 'hide-posts-count',
  SHOW_POST_DATETIME = 'show-post-datetime',
  BSKY_IDENTIFIER = 'bsky-identifier',
  BSKY_PASSWORD = 'bsky-password'
}

// TODO : check if all settings are of the correct type, otherwise cast them to undefined
export const DEFAULT_SETTINGS: TSettings = {
  [APP_SETTINGS.SETTINGS_LAST_UPDATED_VERSION]: '0.0.0',
  [APP_SETTINGS.BLUESKY_OVERHAUL_ENABLED]: true,
  [APP_SETTINGS.HANDLE_VIM_KEYBINDINGS]: false,
  [APP_SETTINGS.HIDE_FOLLOWERS_COUNT]: false,
  [APP_SETTINGS.HIDE_FOLLOWING_COUNT]: false,
  [APP_SETTINGS.HIDE_POSTS_COUNT]: false,
  [APP_SETTINGS.SHOW_POST_DATETIME]: true,
  [APP_SETTINGS.BSKY_IDENTIFIER]: '',
  [APP_SETTINGS.BSKY_PASSWORD]: ''
};
