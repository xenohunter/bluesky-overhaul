// eslint-disable-next-line @typescript-eslint/no-empty-function
export const noop = (): void => {};

export const preventDefault = (e: any): void => e.preventDefault();

export const delay = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

/** Returns 1 if the first argument is greater than the second one */
export const compareSemver = (a?: string, b?: string): number => {
  a = a || '0.0.0';
  b = b || '0.0.0';

  const aParts = a.split('.');
  const bParts = b.split('.');

  for (let i = 0; i < 3; i++) {
    const aPart = parseInt(aParts[i], 10);
    const bPart = parseInt(bParts[i], 10);

    if (aPart > bPart) return 1;
    if (aPart < bPart) return -1;
  }

  return 0;
};
