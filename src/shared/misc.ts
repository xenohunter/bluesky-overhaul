// eslint-disable-next-line @typescript-eslint/no-empty-function
export const noop = (): void => {};

export const preventDefault = (e: any): void => e.preventDefault();

export const delay = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};
