import {TSetting, TSettings} from '../../types';
import React from 'react';
import {APP_SETTINGS} from '../../shared/appSettings';
import Checkbox from '../components/Checkbox';
import Input from '../components/Input';
import {BADGE_LEVEL} from '../components/Badge';
import {preventDefault} from '../../shared/misc';

const nameToText = (name: string): string => {
  return name.split('-').map((word) => word[0].toUpperCase() + word.slice(1)).join(' ');
};

const BADGES: { [key in APP_SETTINGS]?: { type: BADGE_LEVEL, text: string } } = {
  [APP_SETTINGS.BLUESKY_OVERHAUL_ENABLED]: {type: BADGE_LEVEL.DANGER, text: 'page reload'},
  [APP_SETTINGS.HANDLE_VIM_KEYBINDINGS]: {type: BADGE_LEVEL.WARNING, text: 'experimental'},
  [APP_SETTINGS.SHOW_POST_DATETIME]: {type: BADGE_LEVEL.INFO, text: 'requires login'}
};

const TIPS: { [key in APP_SETTINGS]?: string } = {
  [APP_SETTINGS.BLUESKY_OVERHAUL_ENABLED]: 'It will turn back on when the next release is ready',
  [APP_SETTINGS.HANDLE_VIM_KEYBINDINGS]: 'Press "?" while on Bluesky to see the list of keys',
  [APP_SETTINGS.SHOW_POST_DATETIME]: 'Enter your Bluesky credentials to enable this'
};

type FormProps = {
  settings: TSettings;
  onChange: (name: APP_SETTINGS, value: TSetting) => void;
};

export default function Form({settings, onChange}: FormProps): JSX.Element {
  return (
    <form className="form-horizontal" onSubmit={preventDefault}>
      {Object.keys(settings).map((setting) => {
        const name = setting as keyof TSettings;
        const value = settings[name];

        // TODO : introduce explicit types for all settings in TSettings
        if (name === APP_SETTINGS.BSKY_IDENTIFIER || name === APP_SETTINGS.BSKY_PASSWORD) {
          return <Input
            key={name}
            type={name === APP_SETTINGS.BSKY_PASSWORD ? 'password' : 'text'}
            value={value as string} // TODO : fix this
            text={nameToText(name)}
            callback={(newValue) => onChange(name, newValue)}
          />;
        } else {
          return <Checkbox
            key={name}
            value={value as boolean} // TODO : fix this
            text={nameToText(name)}
            badge={BADGES[name]}
            tooltip={TIPS[name]}
            callback={(newValue) => onChange(name, newValue)}
          />;
        }
      })}
    </form>
  );
}
