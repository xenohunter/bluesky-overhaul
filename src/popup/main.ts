import {TSetting, TSettings} from '../types';
import {getSettings, setSettings} from '../shared/api';
import {APP_SETTINGS} from '../shared/appSettings';

const CONTAINER_ID = 'main';
const FORM_ID = 'settings';

const DEFAULT_SETTINGS: TSettings = {
  [APP_SETTINGS.BLUESKY_OVERHAUL_ENABLED]: true,
  [APP_SETTINGS.HANDLE_VIM_KEYBINDINGS]: false,
  [APP_SETTINGS.HIDE_FOLLOWERS_COUNT]: false,
  [APP_SETTINGS.HIDE_FOLLOWING_COUNT]: false,
  [APP_SETTINGS.HIDE_POSTS_COUNT]: false
};

const REQUIRES_PAGE_REFRESH = [APP_SETTINGS.BLUESKY_OVERHAUL_ENABLED];
const EXPERIMENTAL_SETTINGS = [APP_SETTINGS.HANDLE_VIM_KEYBINDINGS];

const TIPS: TSettings = {
  [APP_SETTINGS.BLUESKY_OVERHAUL_ENABLED]: 'It will turn back on when the next release is ready',
  [APP_SETTINGS.HANDLE_VIM_KEYBINDINGS]: 'Press "?" while on Bluesky to see the list of keys'
};

// TODO : make a small React app for this later
const renderSetting = (name: APP_SETTINGS, currentValue: TSetting): HTMLElement => {
  const outerDiv = document.createElement('div');
  outerDiv.classList.add('form-group');
  const innerDiv = document.createElement('div');
  innerDiv.classList.add('col-sm-offset-2', 'col-sm-10');
  const checkboxDiv = document.createElement('div');
  checkboxDiv.classList.add('checkbox');

  const label = document.createElement('label');
  const input = document.createElement('input');
  input.type = 'checkbox';
  input.id = name;
  input.name = name;
  input.checked = currentValue as boolean; // TODO : only works for checkboxes
  label.appendChild(input);
  const title = name.split('-').map((word) => word[0].toUpperCase() + word.slice(1)).join(' ');
  label.appendChild(document.createTextNode(title));

  if (REQUIRES_PAGE_REFRESH.includes(name)) {
    const span = document.createElement('span');
    span.classList.add('label', 'label-danger');
    span.appendChild(document.createTextNode('page reload'));
    label.appendChild(document.createTextNode(' '));
    label.appendChild(span);
  }

  if (EXPERIMENTAL_SETTINGS.includes(name)) {
    const span = document.createElement('span');
    span.classList.add('label', 'label-warning');
    span.appendChild(document.createTextNode('experimental'));
    label.appendChild(document.createTextNode(' '));
    label.appendChild(span);
  }

  if (name in TIPS) {
    const tip = document.createElement('div');
    tip.classList.add('tip');
    const small = document.createElement('small');
    small.appendChild(document.createTextNode(TIPS[name] as string));
    tip.appendChild(small);
    label.appendChild(tip);
  }

  checkboxDiv.appendChild(label);
  innerDiv.appendChild(checkboxDiv);
  outerDiv.appendChild(innerDiv);
  return outerDiv;
};

const renderForm = (allSettings: TSettings, formId: string): HTMLElement => {
  const form = document.createElement('form');
  form.classList.add('form-horizontal');
  form.id = formId;
  Object.keys(allSettings).forEach((s) => {
    const setting = s as APP_SETTINGS;
    const inputElement = renderSetting(setting, allSettings[setting] as boolean);
    form.appendChild(inputElement);
  });
  return form;
};

const initializeForm = (): Promise<HTMLElement> => {
  return getSettings().then((settings: TSettings) => {
    const form = renderForm({...DEFAULT_SETTINGS, ...settings}, FORM_ID);
    document.getElementById(CONTAINER_ID)?.appendChild(form);
    return form;
  });
};

const handleFormChange = (form: HTMLElement, ev: Event): void => {
  ev.preventDefault();
  const newSettings: TSettings = {};
  for (const [name, value] of Object.entries(DEFAULT_SETTINGS)) {
    const n = name as APP_SETTINGS;

    const input = form.querySelector(`#${name}`) as HTMLInputElement | null;
    if (input) {
      newSettings[n] = input.checked;
    } else {
      newSettings[n] = value;
    }
  }

  setSettings(newSettings);
};

document.addEventListener('DOMContentLoaded', async () => {
  const form = await initializeForm();
  form.addEventListener('change', handleFormChange.bind(null, form));
  form.addEventListener('submit', (event) => event.preventDefault());
});
