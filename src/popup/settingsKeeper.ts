import {TSetting} from '../types';
import {APP_SETTINGS, DEFAULT_SETTINGS} from '../shared/appSettings';
import {setSettings} from '../shared/browserApi';
import {SettingsProvider} from '../shared/settingsProvider';

class SettingsKeeper extends SettingsProvider {
  async set(settingName: APP_SETTINGS, value: TSetting): Promise<void> {
    if (!this.isInitialized) throw new Error('SettingsKeeper are not initialized');
    if (!(settingName in DEFAULT_SETTINGS)) throw new Error(`Unknown setting: ${settingName}`);
    const oldSettings = this.getAll();

    try {
      this.settings[settingName] = value;
      await setSettings(this.settings);
    } catch (e) {
      this.settings = oldSettings;
      throw e;
    }
  }
}

const settingsKeeper = new SettingsKeeper();

export const getSettingsKeeper = async (): Promise<SettingsKeeper> => {
  await settingsKeeper.initialize();
  return settingsKeeper;
};
