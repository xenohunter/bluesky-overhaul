import React, { useState } from 'react';
import Badge, { BADGE_LEVEL } from './Badge';
import Tip from './Tip';

type CheckboxProps = {
  value: boolean;
  text: string;
  badge?: { text: string, type: BADGE_LEVEL };
  tooltip?: string;
  callback: (value: boolean) => void;
};

export default function Checkbox({value, text, badge, tooltip, callback}: CheckboxProps): JSX.Element {
  const [checked, setChecked] = useState(value);

  const onChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setChecked(event.target.checked);
    callback(event.target.checked);
  };

  return (
    <div className="form-group">
      <div className="col-sm-offset-2 col-sm-10">
        <div className="checkbox">
          <label>
            <input type="checkbox" checked={checked} onChange={onChange}/>
            <span>{text}</span>
            {badge && <Badge text={badge.text} type={badge.type}/>}
            {tooltip && <Tip text={tooltip}/>}
          </label>
        </div>
      </div>
    </div>
  );
}
