import AWN from 'awesome-notifications';

type NotificationFn = (message: string) => void;

const DURATION = 3000;

// TODO : fix the source of why notifications are updated so often
const throttle = (fn: NotificationFn, delay = DURATION - 1000): NotificationFn => {
  const lastCalls = {} as { [key: string]: number };
  return (message: string): void => {
    const now = (new Date()).getTime();
    const lastCall = lastCalls[message] || 0;
    if (now - lastCall > delay) {
      lastCalls[message] = now;
      fn(message);
    }
  };
};

const notifier = new AWN({
  maxNotifications: 3,
  durations: {
    global: DURATION
  }
});

export const alert = throttle((message: string): void => {
  notifier.alert(message);
});

export const modal = throttle((message: string): void => {
  notifier.modal(message);
});

export const success = throttle((message: string): void => {
  notifier.success(message);
});

export const tip = throttle((message: string): void => {
  notifier.tip(message);
});
