import { Adapter } from "./adapter";
import { GrayColorizer, PanelDetectionInput, PanelDetectionOutput } from "./cv/panel-detection";

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

// order matter !!!
export class PipelineBuilder<S, D> {
  constructor(private _name: string | null = null,  private _adapters: Adapter<any, any>[] = []) {}

  private add(adapter: Adapter<any, any>) {
    this._adapters.push(adapter);
    return this;
  }

  name(name: string) {
    this._name = name;
    return this;
  }

  splitter(splitter: Adapter<PanelDetectionInput, PanelDetectionOutput>) {
    return this.add(new GrayColorizer()).add(splitter);
  }

  build() {
    return new Pipeline<S, D>(this._name, this._adapters);
  }
}