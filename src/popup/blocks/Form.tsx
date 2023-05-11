import {TSettings} from '../../types';
import React from 'react';
import {APP_SETTINGS} from '../../shared/appSettings';
import Checkbox from '../components/Checkbox';
import {BADGE_LEVEL} from '../components/Badge';
import {preventDefault} from '../../shared/misc';

const nameToText = (name: string): string => {
  return name.split('-').map((word) => word[0].toUpperCase() + word.slice(1)).join(' ');
};

const BADGES: { [key in APP_SETTINGS]?: { type: BADGE_LEVEL, text: string } } = {
  [APP_SETTINGS.BLUESKY_OVERHAUL_ENABLED]: {type: BADGE_LEVEL.DANGER, text: 'page reload'},
  [APP_SETTINGS.HANDLE_VIM_KEYBINDINGS]: {type: BADGE_LEVEL.WARNING, text: 'experimental'}
};

const TIPS: { [key in APP_SETTINGS]?: string } = {
  [APP_SETTINGS.BLUESKY_OVERHAUL_ENABLED]: 'It will turn back on when the next release is ready',
  [APP_SETTINGS.HANDLE_VIM_KEYBINDINGS]: 'Press "?" while on Bluesky to see the list of keys'
};

type FormProps = {
  settings: TSettings;
  onChange: (name: APP_SETTINGS, value: boolean) => void;
};

export default function Form({settings, onChange}: FormProps): JSX.Element {
  return (
    <form className="form-horizontal" onSubmit={preventDefault}>
      {Object.keys(settings).map((setting) => {
        const name = setting as keyof TSettings;
        const value = settings[name] as boolean;
        return <Checkbox
          key={name}
          value={value}
          text={nameToText(name)}
          badge={BADGES[name]}
          tooltip={TIPS[name]}
          callback={onChange.bind(null, name)}
        />;
      })}
    </form>
  );
}
