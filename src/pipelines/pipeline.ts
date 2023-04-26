export abstract class Pipeline {
  abstract deploy(modal: HTMLElement): void;
  abstract terminate(): void;
}
