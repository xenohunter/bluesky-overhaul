const browserAPI = window.browser || chrome;

const CONTAINER_ID = 'main';
const FORM_ID = 'settings';

// TODO : this should be imported from the main part of the code (APP_SETTINGS from ./src/browser/appSettings.js)
const DEFAULT_SETTINGS = {
  'vim-keybindings': false,
  'hide-followers-count': false,
  'hide-following-count': false,
  'hide-posts-count': false
};

const EXPERIMENTAL_SETTINGS = ['vim-keybindings'];

const TIPS = {
  'vim-keybindings': 'Press "?" while on Bluesky to see the list of keys',
};

// TODO : make a small React app for this later
const renderSetting = (name, currentValue) => {
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
  input.checked = currentValue;
  label.appendChild(input);
  const title = name.split('-').map((word) => word[0].toUpperCase() + word.slice(1)).join(' ');
  label.appendChild(document.createTextNode(title));

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
    small.appendChild(document.createTextNode(TIPS[name]));
    tip.appendChild(small);
    label.appendChild(tip);
  }

  checkboxDiv.appendChild(label);
  innerDiv.appendChild(checkboxDiv);
  outerDiv.appendChild(innerDiv);
  return outerDiv;
};

const renderForm = (allSettings, currentSettings, formId) => {
  const form = document.createElement('form');
  form.classList.add('form-horizontal');
  form.id = formId;
  Object.keys(allSettings).forEach((s) => {
    form.appendChild(renderSetting(s, s in currentSettings ? currentSettings[s] : allSettings[s]));
  });
  return form;
};

const initializeForm = () => {
  return browserAPI.storage.local.get().then((storageContents) => {
    const settings = storageContents.settings || {};
    const form = renderForm(DEFAULT_SETTINGS, settings, FORM_ID);
    document.getElementById(CONTAINER_ID).appendChild(form);
    return form;
  });
};

const handleFormChange = (form, ev) => {
  ev.preventDefault();
  const newSettings = {};
  for (const [name, value] of Object.entries(DEFAULT_SETTINGS)) {
    const input = form.querySelector(`#${name}`);
    if (input) {
      newSettings[name] = input.checked;
    } else {
      newSettings[name] = value;
    }
  }

  browserAPI.storage.local.set({
    'settings': newSettings
  });
};

document.addEventListener('DOMContentLoaded', async () => {
  const form = await initializeForm();
  form.addEventListener('change', handleFormChange.bind(null, form));
  form.addEventListener('submit', (event) => event.preventDefault());
});
