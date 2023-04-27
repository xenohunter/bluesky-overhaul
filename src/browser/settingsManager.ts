import {ISettingsSubscriber} from '../interfaces';
import {getSettings, subscribeToSettings, TSettings} from './api';

export type TSetting = boolean | number | string;
export type TListener = (optionName: string, value: TSetting) => void;

class SettingsManager {
  readonly #listeners: { [key: string]: TListener[] } = {};
  #currentSettings: TSettings = {};
  #isInitialized = false;

  async initialize(): Promise<SettingsManager> {
    if (this.#isInitialized) return this;
    this.#currentSettings = await getSettings();
    subscribeToSettings(this.#onSettingsChange.bind(this));
    this.#isInitialized = true;
    return this;
  }

  subscribe(listener: ISettingsSubscriber): void {
    if (!this.#isInitialized) throw new Error('SettingsManager is not initialized');

    listener.SETTINGS.forEach((settingName) => {
      if (!this.#listeners[settingName]) {
        this.#listeners[settingName] = [];
      }

      const callback = listener.onSettingChange.bind(listener);
      this.#listeners[settingName].push(callback);
      if (settingName in this.#currentSettings) {
        callback(settingName, this.#currentSettings[settingName]);
      }
    });
  }

  #onSettingsChange(newSettings: TSettings): void {
    this.#currentSettings = {...this.#currentSettings, ...newSettings};
    for (const [key, value] of Object.entries(newSettings)) {
      if (this.#listeners[key]) {
        this.#listeners[key].forEach((listener) => listener(key, value));
      }
    }
  }
}

const settingsManager = new SettingsManager();

export const createSettingsManager = async () => {
  return await settingsManager.initialize();
};
