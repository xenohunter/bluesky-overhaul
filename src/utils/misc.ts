// eslint-disable-next-line @typescript-eslint/no-empty-function
export const noop = (): void => {};

export const delay = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};
