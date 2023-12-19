import { TSetting } from './types';
import { APP_SETTINGS } from './shared/appSettings';

export interface IPausable {
  start(): void;
  pause(): void;
}

export interface ISettingsSubscriber {
  onSettingChange(name: APP_SETTINGS, value: TSetting): void;
  get SETTINGS(): APP_SETTINGS[];
}
