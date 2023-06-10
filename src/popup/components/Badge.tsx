import React from 'react';

export enum BADGE_LEVEL {
  SUCCESS = 'success',
  INFO = 'info',
  WARNING = 'warning',
  DANGER = 'danger'
}

type BadgeProps = {
  text: string;
  type: BADGE_LEVEL;
};

export default function Badge({text, type}: BadgeProps): JSX.Element {
  const badgeClasses = `label label-${type}`;
  return (
    <span>&nbsp;<span className={badgeClasses}>{text}</span></span>
  );
}
