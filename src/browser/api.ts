import {APP_SETTINGS} from './appSettings';

export type TSetting = boolean | number | string;
export type TSettings = { [key in APP_SETTINGS]?: TSetting };

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const browserAPI = window.browser || chrome;

const SETTINGS_KEY = 'settings';

export const clearStorage = async (): Promise<void> => {
  await browserAPI.storage.local.clear();
};

export const getSettings = async (): Promise<TSettings> => {
  const storage = await browserAPI.storage.local.get();
  return storage[SETTINGS_KEY] || {};
};

export const subscribeToSettings = (listener: (newSettings: TSettings) => void): void => {
  browserAPI.storage.onChanged.addListener((changes: any, namespace: any) => {
    if (namespace === 'local' && changes[SETTINGS_KEY]) {
      listener(changes[SETTINGS_KEY].newValue);
    }
  });
};
