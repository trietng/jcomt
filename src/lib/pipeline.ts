import { Adapter, AsyncAdapter } from "./adapter";

export class Pipeline<S, D> {
  constructor(private name: string | null, private adapters: Adapter<any, any>[]) {}

  static builder<S, D>() {
    return new PipelineBuilder<S, D>();
  }

  run(input: S): D {
    let output: any = input;
    this.adapters.forEach((adapter, index) => {
      output = adapter.convert(output);   
      console.log(`Pipeline ${this.name} - step ${index} - ${adapter.constructor.name}: completed`);
    });
    return output;
  }
}

export class AsyncPipeline<S, D> {
  constructor(private name: string | null, private adapters: AsyncAdapter<any, any>[]) {}

  static builder<S, D>() {
    return new PipelineBuilder<S, D>();
  }

  async run(input: S): Promise<D> {
    let output: any = input;
    let index = 0;
    for await (const adapter of this.adapters) {
      output = await adapter.convert(output);
      console.log(`Pipeline ${this.name} - step ${index} - ${adapter.constructor.name}: completed`);
      index++;
    }
    return output;
  }
}

abstract class NamedPipelineBuilder {
  constructor(protected _name: string | null = null) {}
  name(name: string) {
    this._name = name;
    return this;
  }
}

// order matter !!!
export class PipelineBuilder<S, D> extends NamedPipelineBuilder {
  constructor(private _adapters: Adapter<any, any>[] = []) {
    super();
  }

  add(adapter: Adapter<any, any>) {
    this._adapters.push(adapter);
    return this;
  }

  build() {
    return new Pipeline<S, D>(this._name, this._adapters);
  }
}

export class AsyncPipelineBuilder<S, D> extends NamedPipelineBuilder {
  constructor(private _adapters: AsyncAdapter<any, any>[] = []) {
    super();
  }

  add(adapter: AsyncAdapter<any, any>) {
    this._adapters.push(adapter);
    return this;
  }

  build() {
    return new AsyncPipeline<S, D>(this._name, this._adapters);
  }
}