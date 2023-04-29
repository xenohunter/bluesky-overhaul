const browserAPI = chrome || browser;

const CONTAINER_ID = 'main';
const FORM_ID = 'settings';
const CLEAR_ID = 'clear';

// TODO : this should be imported from the main part of the code
const DEFAULT_SETTINGS = {
  'vim-keybindings': false
};

// TODO : make a small React app for this later
const renderSetting = (name, currentValue) => {
  const div = document.createElement('div');
  const label = document.createElement('label');
  const input = document.createElement('input');
  input.type = 'checkbox';
  input.id = name;
  input.name = name;
  input.checked = currentValue;
  label.appendChild(input);
  const title = name.split('-').map((word) => word[0].toUpperCase() + word.slice(1)).join(' ');
  label.appendChild(document.createTextNode(title));
  div.appendChild(label);
  return div;
};

const renderSubmit = () => {
  const div = document.createElement('div');
  const button = document.createElement('button');
  button.type = 'submit';
  button.appendChild(document.createTextNode('Save'));
  div.appendChild(button);
  return div;
};

const renderForm = (allSettings, currentSettings, formId) => {
  const form = document.createElement('form');
  form.id = formId;
  Object.keys(allSettings).forEach((s) => {
    form.appendChild(renderSetting(s, s in currentSettings ? currentSettings[s] : allSettings[s]));
  });
  form.appendChild(renderSubmit());
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

const log = (msg) => {
  const logDiv = document.getElementById('lastUpdate');
  logDiv.innerHTML = msg + '<br/>' + logDiv.innerHTML;
};

const handleFormSubmit = (form, ev) => {
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
  }).then(() => {
    log('Settings saved');
  });
};

const handleClearClick = (ev) => {
  ev.preventDefault();
  browserAPI.storage.local.clear().then(() => {
    log('Settings cleared');
  });
};

document.addEventListener('DOMContentLoaded', async () => {
  const form = await initializeForm();
  form.addEventListener('submit', handleFormSubmit.bind(null, form));
  document.getElementById(CLEAR_ID).addEventListener('click', handleClearClick);
});
