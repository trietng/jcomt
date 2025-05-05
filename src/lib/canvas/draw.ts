import { Translation } from "../common/model";

const FONT_HEIGHT = 30;
const TEXT_VERTICAL_OFFSET = FONT_HEIGHT * 3;
const TEXT_HORIZONTAL_OFFSET = FONT_HEIGHT * 3;

/**
 * Draw on speech bubbles
 */
export async function drawTranslations(
  dataUrl: string,
  translations: Translation[]
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
    const font = `${FONT_HEIGHT}px Geologica`;
    await document.fonts.load(font);
    ctx.font = font;
    ctx.textBaseline = "middle";
    ctx.textAlign = "center";
    translations.forEach((translation) => {
      ctx.fillStyle = "white";
      // box_2d: [y_min, x_min, y_max, x_max]
      ctx.fillRect(
        translation.box_2d[1] / 1000 * canvas.width,
        translation.box_2d[0] / 1000 * canvas.height,
        (translation.box_2d[3] - translation.box_2d[1]) / 1000 * canvas.width,
        (translation.box_2d[2] - translation.box_2d[0]) / 1000 * canvas.height,
      )
      ctx.fillStyle = "black"
      const lines = translation.translated_text.split("\n");
      lines.forEach((line, index) => {
        ctx.fillText(
          line, 
          translation.box_2d[1] / 1000 * canvas.width + TEXT_HORIZONTAL_OFFSET,
          translation.box_2d[0] / 1000 * canvas.height + index * FONT_HEIGHT + TEXT_VERTICAL_OFFSET
        )
      });
    })
  }
  return canvas.toDataURL();
}