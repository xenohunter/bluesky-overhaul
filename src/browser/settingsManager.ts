import {ISettingsSubscriber} from '../interfaces';
import {getSettings, subscribeToSettings, TSetting, TSettings} from './api';
import {APP_SETTINGS} from './appSettings';
import {success} from '../utils/notifications';

export type TListener = (settingName: APP_SETTINGS, value: TSetting) => void;

class SettingsManager {
  readonly #listeners: { [key in APP_SETTINGS]?: TListener[] } = {};
  #currentSettings: TSettings = {};
  #isInitialized = false;

  async initialize(): Promise<void> {
    if (this.#isInitialized) return;
    this.#currentSettings = await getSettings();
    subscribeToSettings(this.#onSettingsChange.bind(this));
    this.#isInitialized = true;
  }

  get(settingName: APP_SETTINGS): TSetting | undefined {
    if (!this.#isInitialized) throw new Error('SettingsManager is not initialized');
    return this.#currentSettings[settingName];
  }

  subscribe(subscriber: ISettingsSubscriber): void {
    if (!this.#isInitialized) throw new Error('SettingsManager is not initialized');

    subscriber.SETTINGS.forEach((settingName: APP_SETTINGS) => {
      if (!this.#listeners[settingName]) {
        this.#listeners[settingName] = [];
      }

      const callback = subscriber.onSettingChange.bind(subscriber);
      this.#listeners[settingName]?.push(callback);
      if (settingName in this.#currentSettings) {
        callback(settingName, this.#currentSettings[settingName] as TSetting);
      }
    });
  }

  #onSettingsChange(newSettings: TSettings): void {
    this.#currentSettings = {...this.#currentSettings, ...newSettings};
    for (const [key, value] of Object.entries(newSettings)) {
      if (key in this.#listeners) {
        const settingName = key as APP_SETTINGS; // TODO : sort out the typing around APP_SETTINGS
        const listeners = this.#listeners[settingName] as TListener[];
        listeners.forEach((listener) => listener(settingName, value));
      }
    }

    success('Settings updated');
  }
}

const settingsManager = new SettingsManager();

export const getSettingsManager = async (): Promise<SettingsManager> => {
  await settingsManager.initialize();
  return settingsManager;
};
