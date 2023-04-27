export type TSettings = { [key: string]: boolean | number | string };

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const browserAPI = chrome || browser;

const SETTINGS_KEY = 'settings';

export const getSettings = async () => {
  return await browserAPI.storage.local.get(SETTINGS_KEY);
};

export const subscribeToSettings = (listener: (newSettings: TSettings) => void) => {
  browserAPI.storage.onChanged.addListener((changes, namespace) => {
    if (namespace === 'local' && changes[SETTINGS_KEY]) {
      listener(changes[SETTINGS_KEY].newValue);
    }
  });
};
