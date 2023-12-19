import React from 'react';
import { createRoot } from 'react-dom/client';
import { initializeSentry } from '../shared/sentry';
import { getSettingsKeeper } from './settingsKeeper';
import Form from './blocks/Form';

const CONTAINER_ID = 'main';

initializeSentry('popup');

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
        onChange={(name, value) => settingsKeeper.set(name, value)}
      />
    );
  }
});
