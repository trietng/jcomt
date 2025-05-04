import { init } from "./utils";

export interface Adapter<S, D> {
  convert: (src: S) => D 
};

export interface AsyncAdapter<S, D> {
  convert: (src: S) => Promise<D>;
}