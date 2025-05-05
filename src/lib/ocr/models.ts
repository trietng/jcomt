import { Block } from "tesseract.js";

export interface CanvasBox {
  top: number;
  left: number;
  width: number;
  height: number;
}

export interface CanvasBlock {
  text: string;
  box: CanvasBox;
}

export type MergedBlock = Pick<Block, "bbox" | "text">;