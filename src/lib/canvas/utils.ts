import { MergedBlock } from "../ocr/models";

const FONT_HEIGHT = 32;
const TEXT_VERTICAL_OFFSET = FONT_HEIGHT * 2.5;
const TEXT_HORIZONTAL_OFFSET = FONT_HEIGHT * 3.5;

/**
 * Draw on speech bubbles
 */
export async function drawOnBubbles(
  dataUrl: string, 
  blocks: MergedBlock[],
) {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  const image = new Image();
  image.src = dataUrl;
  await image.decode();
  canvas.width = image.width;
  canvas.height = image.height;
  if (ctx) {
    ctx.drawImage(image, 0, 0);
    ctx.font = `${FONT_HEIGHT}px Geist Mono`;
    ctx.textAlign = "center";
  }
  return canvas.toDataURL();
}