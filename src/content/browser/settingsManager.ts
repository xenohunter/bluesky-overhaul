import { TSetting, TSettings } from '../../types';
import { ISettingsSubscriber } from '../../interfaces';
import { APP_SETTINGS } from '../../shared/appSettings';
import { subscribeToSettings } from '../../shared/browserApi';
import { SettingsProvider } from '../../shared/settingsProvider';
import { success } from '../utils/notifications';

export type TListener = (settingName: APP_SETTINGS, value: TSetting) => void;

class SettingsManager extends SettingsProvider {
  readonly #listeners: { [key in APP_SETTINGS]?: TListener[] } = {};

  async initialize(): Promise<void> {
    // TODO : this might be called twice or more, which is not good
    await super.initialize();
    subscribeToSettings(this.#onSettingsChange.bind(this));
  }

  subscribe(subscriber: ISettingsSubscriber): void {
    if (!this.isInitialized) throw new Error('SettingsManager is not initialized');
    subscriber.SETTINGS.forEach((settingName: APP_SETTINGS) => {
      if (!this.#listeners[settingName]) {
        this.#listeners[settingName] = [];
      }

      const callback = subscriber.onSettingChange.bind(subscriber);
      this.#listeners[settingName]?.push(callback);
      if (settingName in this.settings) {
        callback(settingName, this.settings[settingName] as TSetting);
      }
    });
  }

  #onSettingsChange(newSettings: TSettings): void {
    this.settings = {...this.settings, ...newSettings};
    for (const [key, value] of Object.entries(newSettings)) {
      if (key in this.#listeners) {
        const settingName = key as APP_SETTINGS;
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
