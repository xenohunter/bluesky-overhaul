import React from 'react';

type TipProps = {
  text: string;
};

export default function Tip({text}: TipProps): JSX.Element {
  return (
    <div>
      <small>{text}</small>
    </div>
  );
}
