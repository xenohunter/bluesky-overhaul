import {TSetting} from './browser/settingsManager';

export interface IPausable {
  pause(): void;
  resume(): void;
}

export interface ISettingsSubscriber {
  get SETTINGS(): string[];
  onSettingChange(name: string, value: TSetting): void;
}
