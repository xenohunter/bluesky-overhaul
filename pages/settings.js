const browserAPI = chrome || browser;

const initializeSettings = () => {
  browserAPI.storage.local.get().then((settings) => {
    console.log('Settings loaded', settings);
  });
};

const log = (msg) => {
  document.getElementById('lastUpdate').innerHTML = msg;
};

document.addEventListener('DOMContentLoaded', () => {
  initializeSettings();
  log('Settings initialized');

  // TODO! : clear the settings once

  document.getElementById('settings').addEventListener('submit', (ev) => {
    ev.preventDefault();
    browserAPI.storage.local.set({
      settings: {
        vim: document.getElementById('vim').checked // TODO! : traverse the form and save all the values
      }
    }).then(() => {
      log('Settings saved');
    });
  });
});
