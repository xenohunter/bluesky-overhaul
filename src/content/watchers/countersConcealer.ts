import { TSetting, TSettings } from '../../types';
import { APP_SETTINGS } from '../../shared/appSettings';
import { ISettingsSubscriber } from '../../interfaces';
import { Watcher } from './watcher';

const DEFAULT_SETTINGS: Partial<TSettings> = {
  [APP_SETTINGS.HIDE_FOLLOWERS_COUNT]: false,
  [APP_SETTINGS.HIDE_FOLLOWING_COUNT]: false,
  [APP_SETTINGS.HIDE_POSTS_COUNT]: false
};

const CONCEALER_CLASS = 'bluesky-overhaul-concealer';
const HIDE_FOLLOWERS_CLASS = 'bluesky-overhaul-hide-followers';
const HIDE_FOLLOWING_CLASS = 'bluesky-overhaul-hide-following';
const HIDE_POSTS_CLASS = 'bluesky-overhaul-hide-posts';

export class CountersConcealer extends Watcher implements ISettingsSubscriber {
  #container: HTMLElement;

  constructor(documentBody: HTMLElement) {
    super();
    this.#container = documentBody;
  }

  watch(): void {
    this.#container.classList.add(CONCEALER_CLASS);
  }

  onSettingChange(name: APP_SETTINGS, value: TSetting): void {
    if (!this.SETTINGS.includes(name)) throw new Error(`Unknown setting name "${name}"`);
    if (typeof value !== typeof DEFAULT_SETTINGS[name]) throw new Error(`Invalid value "${value}" for "${name}"`);

    if (name === APP_SETTINGS.HIDE_FOLLOWERS_COUNT) {
      this.#toggleClass(value as boolean, HIDE_FOLLOWERS_CLASS);
    } else if (name === APP_SETTINGS.HIDE_FOLLOWING_COUNT) {
      this.#toggleClass(value as boolean, HIDE_FOLLOWING_CLASS);
    } else if (name === APP_SETTINGS.HIDE_POSTS_COUNT) {
      this.#toggleClass(value as boolean, HIDE_POSTS_CLASS);
    }
  }

  get SETTINGS(): APP_SETTINGS[] {
    return Object.keys(DEFAULT_SETTINGS) as APP_SETTINGS[];
  }

  #toggleClass(enable: boolean, className: string): void {
    if (enable) {
      this.#container.classList.add(className);
    } else {
      this.#container.classList.remove(className);
    }
  }
}
