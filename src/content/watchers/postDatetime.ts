import { createPopper } from '@popperjs/core';

import { TSetting, TSettings } from '../../types';
import { APP_SETTINGS } from '../../shared/appSettings';
import { ISettingsSubscriber } from '../../interfaces';
import { Watcher } from './watcher';
import { getSettingsManager } from '../browser/settingsManager';
import { getAgent, fetchPost, LoginError } from '../bsky/api';
import { alert } from '../utils/notifications';

const DEFAULT_SETTINGS: Partial<TSettings> = {
  [APP_SETTINGS.SHOW_POST_DATETIME]: false,
  [APP_SETTINGS.BSKY_IDENTIFIER]: '',
  [APP_SETTINGS.BSKY_PASSWORD]: ''
};

type PostUrl = {
  username: string;
  postId: string;
};

const POST_HREF_REGEX = /profile\/(.+)\/post\/([a-zA-Z0-9]+)$/;
const DATETIME_MARKER = 'data-bluesky-overhaul-datetime';

const getCredentials = async (): Promise<[string, string]> => {
  const settingsManager = await getSettingsManager();
  return await Promise.all([
    settingsManager.get(APP_SETTINGS.BSKY_IDENTIFIER) as string,
    settingsManager.get(APP_SETTINGS.BSKY_PASSWORD) as string
  ]);
};

const parsePostUrl = (url: string | null): PostUrl => {
  if (!url) throw new Error('Missing post URL');
  const match = url.match(POST_HREF_REGEX);
  if (!match) throw new Error('Invalid post URL');
  return {username: match[1], postId: match[2]};
};

const parsePostDatetime = (datetime: string): string => {
  const date = new Date(datetime);
  return date.toLocaleString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric', hour: 'numeric', minute: 'numeric'
  });
};

const createDatetimeTooltip = (datetime: string): HTMLElement => {
  const tooltip = document.createElement('div');
  tooltip.role = 'tooltip';
  tooltip.className = 'bluesky-overhaul-tooltip';
  tooltip.textContent = datetime;
  return tooltip;
};

export class PostDatetimeWatcher extends Watcher implements ISettingsSubscriber {
  #container: HTMLElement;
  #enabled: boolean;

  constructor(container: HTMLElement) {
    super();
    this.#container = container;
    this.#enabled = DEFAULT_SETTINGS[APP_SETTINGS.SHOW_POST_DATETIME] as boolean;
  }

  watch(): void {
    this.#container.addEventListener('mouseover', this.#handleMouseOver.bind(this));
  }

  onSettingChange(name: APP_SETTINGS, value: TSetting): void {
    if (!this.SETTINGS.includes(name)) throw new Error(`Unknown setting name "${name}"`);
    if (typeof value !== typeof DEFAULT_SETTINGS[name]) throw new Error(`Invalid value "${value}" for "${name}"`);

    if (name === APP_SETTINGS.SHOW_POST_DATETIME) {
      this.#enabled = value as boolean;
    }
  }

  get SETTINGS(): APP_SETTINGS[] {
    return Object.keys(DEFAULT_SETTINGS) as APP_SETTINGS[];
  }

  async #handleMouseOver(event: MouseEvent): Promise<void> {
    if (!this.#enabled) return;

    const target = event.target as HTMLElement;
    if (target.tagName.toLowerCase() !== 'a') return;

    let datetime = target.getAttribute(DATETIME_MARKER);
    if (!datetime) {
      try {
        const {username, postId} = parsePostUrl(target.getAttribute('href'));
        if (username && postId) {
          const [identifier, password] = await getCredentials();

          try {
            const agent = await getAgent(identifier, password);
            const post = await fetchPost(agent, username, postId);

            datetime = parsePostDatetime(post.indexedAt);
            target.setAttribute(DATETIME_MARKER, datetime);
          } catch (error) {
            if (error instanceof LoginError) alert('Login failed: wrong identifier or password');
            return;
          }
        } else {
          return;
        }
      } catch {
        return;
      }
    }

    const tooltip = createDatetimeTooltip(datetime);
    document.body.appendChild(tooltip);
    const instance = createPopper(target, tooltip, {
      placement: 'top'
    });

    target.addEventListener('mouseleave', () => {
      instance.destroy();
      tooltip.remove();
    }, {once: true});
  }
}
