import { Pipeline } from '../pipelines/pipeline';
import { log } from './logger';

export class PipelineManager {
  pipelines: { [key: string]: Pipeline[] };

  constructor(pipelines: { [key: string]: Pipeline[] }) {
    this.pipelines = pipelines;
  }

  deploy(type: string, target: HTMLElement): void {
    this.pipelines[type].forEach((pipeline) => {
      try {
        pipeline.deploy(target);
      } catch (e) {
        log(`Pipeline ${pipeline.constructor.name} was deployed with errors`, e);
      }
    });
  }

  terminate(type: string): void {
    this.pipelines[type].forEach((pipeline) => {
      try {
        pipeline.terminate();
      } catch (e) {
        log(`Pipeline ${pipeline.constructor.name} was terminated with errors`, e);
      }
    });
  }

  terminateAll(): void {
    Object.keys(this.pipelines).forEach((t) => this.terminate(t));
  }

  terminateExcept(type: string): void {
    Object.keys(this.pipelines).filter((t) => t !== type).forEach((t) => this.terminate(t));
  }
}
