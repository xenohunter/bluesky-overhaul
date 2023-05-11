import React from 'react';
import {createRoot} from 'react-dom/client';
import {getSettingsKeeper} from './settingsKeeper';
import Form from './blocks/Form';

const CONTAINER_ID = 'main';

document.addEventListener('DOMContentLoaded', async () => {
  const settingsKeeper = await getSettingsKeeper();
  const settings = settingsKeeper.getAll();

  const root = document.getElementById(CONTAINER_ID);
  if (!root) {
    throw new Error('Could not find root element');
  } else {
    createRoot(root).render(
      <Form
        settings={settings}
        onChange={settingsKeeper.set.bind(settingsKeeper)}
      />
    );
  }
});
