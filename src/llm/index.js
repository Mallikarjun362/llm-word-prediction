import { pipeline, env } from '@xenova/transformers';
env.allowLocalModels = false;

export class BERTModelPipeline {
    constructor() {
        this.pipe = null;
    }
    async loadModel() {
        this.pipe = await pipeline('fill-mask', 'Xenova/bert-base-cased');
    }
    async predict(x) {
        return await this.pipe(`${x} [MASK].`);;
    }
    train(x, y, n_epochs) { }
    setModelParameters(params) { }
}
