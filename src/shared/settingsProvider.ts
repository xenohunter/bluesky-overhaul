import {TSetting, TSettings} from '../types';
import {APP_SETTINGS, DEFAULT_SETTINGS} from './appSettings';
import {getSettings, setSettings} from './browserApi';
import {compareSemver} from './misc';
import {BLUESKY_OVERHAUL_VERSION} from './version';
import {log} from '../content/utils/logger';

const possiblyMigrate = async (settings: TSettings): Promise<TSettings> => {
  const lastUpdatedVersion = settings[APP_SETTINGS.SETTINGS_LAST_UPDATED_VERSION] as string;
  const comparison = compareSemver(BLUESKY_OVERHAUL_VERSION, lastUpdatedVersion);

  if (comparison === 1) {
    log('Migrating settings from', lastUpdatedVersion, 'to', BLUESKY_OVERHAUL_VERSION);
    settings[APP_SETTINGS.SETTINGS_LAST_UPDATED_VERSION] = BLUESKY_OVERHAUL_VERSION;
    settings[APP_SETTINGS.BLUESKY_OVERHAUL_ENABLED] = true;
    await setSettings(settings);
  } else if (comparison === -1) {
    log(`Settings are from the future, resetting back to defaults (${lastUpdatedVersion} > ${BLUESKY_OVERHAUL_VERSION})`);
    await setSettings(DEFAULT_SETTINGS);
  }

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
    const migratedSettings = await possiblyMigrate(savedSettings);
    this.settings = {...DEFAULT_SETTINGS, ...migratedSettings};
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
