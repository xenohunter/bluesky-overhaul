import {TSetting} from './browser/api';
import {APP_SETTINGS} from './browser/appSettings';

export interface IPausable {
  pause(): void;
  resume(): void;
}

export interface ISettingsSubscriber {
  onSettingChange(name: APP_SETTINGS, value: TSetting): void;
  get SETTINGS(): APP_SETTINGS[];
}
