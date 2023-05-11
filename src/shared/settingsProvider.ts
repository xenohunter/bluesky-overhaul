import {TSetting, TSettings} from '../types';
import {APP_SETTINGS, DEFAULT_SETTINGS} from './appSettings';
import {getSettings} from './browserApi';

export class SettingsProvider {
  protected settings: TSettings = {...DEFAULT_SETTINGS};
  protected isInitialized = false;

  async initialize(): Promise<void> {
    if (this.isInitialized) return;
    const savedSettings = await getSettings();
    this.settings = {...DEFAULT_SETTINGS, ...savedSettings};
    this.isInitialized = true;
  }

  getAll(): TSettings {
    if (!this.isInitialized) throw new Error('SettingsKeeper are not initialized');
    return {...this.settings};
  }

  get(settingName: APP_SETTINGS): TSetting {
    if (!this.isInitialized) throw new Error('SettingsKeeper are not initialized');
    if (!(settingName in this.settings)) throw new Error(`Setting ${settingName} is not present`);
    return this.settings[settingName];
  }
}
