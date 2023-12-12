import {TSetting, TSettings} from '../types';
import {APP_SETTINGS, DEFAULT_SETTINGS} from './appSettings';
import {getSettings, setSettings} from './browserApi';
import { compareSemver } from './misc';
import { BLUESKY_OVERHAUL_VERSION } from './version';

const possiblyMigrate = async (settings: TSettings): Promise<TSettings> => {
  const isEnabled = settings[APP_SETTINGS.BLUESKY_OVERHAUL_ENABLED] as boolean;
  const lastUpdatedVersion = settings[APP_SETTINGS.SETTINGS_LAST_UPDATED_VERSION] as string;

  if (isEnabled === false && compareSemver(BLUESKY_OVERHAUL_VERSION, lastUpdatedVersion) === 1) {
    settings[APP_SETTINGS.BLUESKY_OVERHAUL_ENABLED] = true;
    settings[APP_SETTINGS.SETTINGS_LAST_UPDATED_VERSION] = BLUESKY_OVERHAUL_VERSION;
  }

  await setSettings(settings);
  return settings;
};

export class SettingsProvider {
  protected settings: TSettings = {...DEFAULT_SETTINGS};
  protected isInitialized = false;

  /** This method is (and must be) called by all child classes at startup */
  // TODO : probably better to replace this behavior with a factory function?
  async initialize(): Promise<void> {
    if (this.isInitialized) return;
    const savedSettings = await getSettings();
    await possiblyMigrate(savedSettings);
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
