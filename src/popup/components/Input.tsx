import React, { useState } from 'react';

type InputProps = {
  type: string;
  value: string;
  text: string;
  callback: (value: string) => void;
};

export default function Input({type, value, text, callback}: InputProps): JSX.Element {
  const [inputContents, setInputContents] = useState(value);

  const onChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setInputContents(event.target.value);
    callback(event.target.value);
  };

  return (
    <div className="form-group">
      <div className="col-sm-offset-2 col-sm-10">
        <div className="input-group">
          <label>
            <input
              type={type}
              value={inputContents}
              placeholder={text}
              onChange={onChange}
            />
          </label>
        </div>
      </div>
    </div>
  );
}

Input.defaultProps = {
  type: 'text'
};
