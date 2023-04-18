import {log} from './logger';

export class PipelineManager {
  constructor(pipelines) {
    this.pipelines = pipelines;
  }

  deploy(type, target = {}) {
    this.pipelines[type].forEach(pipeline => {
      try {
        pipeline.deploy(target, type);
      } catch (e) {
        log(`Pipeline ${pipeline.constructor.name} was deployed with errors`, e);
      }
    });
  }

  terminate(type) {
    this.pipelines[type].forEach(pipeline => {
      try {
        pipeline.terminate();
      } catch (e) {
        log(`Pipeline ${pipeline.constructor.name} was terminated with errors`, e);
      }
    });
  }

  terminateAll() {
    Object.keys(this.pipelines).forEach((t) => this.terminate(t));
  }

  terminateExcept(type) {
    Object.keys(this.pipelines).filter(t => t !== type).forEach((t) => this.terminate(t));
  }
}
