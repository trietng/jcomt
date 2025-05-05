import * as cv from "@techstark/opencv-js";
import { Adapter, AsyncAdapter } from "../adapter";
import { PanelDetectionInput } from "./panel-detection";

// Box represents the four corners of a rectangular region
export interface Box {
  topLeft: cv.Point;
  topRight: cv.Point;
  bottomRight: cv.Point;
  bottomLeft: cv.Point;
}

// Utility class for common operations
export class OpenCVUtils {
  static euclideanDistance(pt1: cv.Point, pt2: cv.Point): number {
    return Math.sqrt(Math.pow(pt2.x - pt1.x, 2) + Math.pow(pt2.y - pt1.y, 2));
  }

  static orderCorners(corners: cv.Point[]): [cv.Point, cv.Point, cv.Point, cv.Point] {
    // Sort by y-coordinate first
    const sortedByY = [...corners].sort((a, b) => a.y - b.y);
    
    // Top two and bottom two points
    const top = sortedByY.slice(0, 2).sort((a, b) => a.x - b.x);
    const bottom = sortedByY.slice(2, 4).sort((a, b) => a.x - b.x);
    
    // Return in order: top-left, top-right, bottom-right, bottom-left
    return [top[0], top[1], bottom[1], bottom[0]];
  }

  static rectToBox(rect: cv.RotatedRect): Box {
    // this is a type bug, should work if new version is released
    const points: cv.Point[] = (cv.RotatedRect as any).points(rect);
    const [topLeft, topRight, bottomRight, bottomLeft] = this.orderCorners(points);
    return { topLeft, topRight, bottomRight, bottomLeft };
  }

  static transformPanel(image: cv.Mat, box: Box): cv.Mat {
    const { topLeft, topRight, bottomRight, bottomLeft } = box;
    
    const width = Math.round(this.euclideanDistance(topLeft, topRight));
    const height = Math.round(this.euclideanDistance(topLeft, bottomLeft));
    
    // Source points
    const srcTri = cv.matFromArray(4, 1, cv.CV_32FC2, [
      topLeft.x, topLeft.y,
      topRight.x, topRight.y,
      bottomRight.x, bottomRight.y,
      bottomLeft.x, bottomLeft.y
    ]);
    
    // Destination points
    const dstTri = cv.matFromArray(4, 1, cv.CV_32FC2, [
      0, 0,
      width - 1, 0,
      width - 1, height - 1,
      0, height - 1
    ]);
    
    // Get perspective transform matrix
    const M = cv.getPerspectiveTransform(srcTri, dstTri);
    
    // Apply perspective transformation
    const transformedPanel = new cv.Mat();
    cv.warpPerspective(image, transformedPanel, M, new cv.Size(width, height));
    
    // Clean up
    srcTri.delete();
    dstTri.delete();
    M.delete();
    
    return transformedPanel;
  }
  
  static drawBox(image: cv.Mat, box: Box, color: cv.Scalar, thickness: number): void {
    const { topLeft, topRight, bottomRight, bottomLeft } = box;
    
    const boxContour = new cv.MatVector();
    const mat = cv.matFromArray(4, 1, cv.CV_32SC2, [
      topLeft.x, topLeft.y,
      topRight.x, topRight.y,
      bottomRight.x, bottomRight.y,
      bottomLeft.x, bottomLeft.y
    ]);
    
    boxContour.push_back(mat);
    cv.polylines(image, boxContour, true, color, thickness);
    
    // Clean up
    mat.delete();
    boxContour.delete();
  }
}

export class DataUrlToPanelDetectionInputAdapter implements AsyncAdapter<string, PanelDetectionInput> {
  constructor(private displayCallback?: (image: cv.Mat) => void) {}

   async convert(dataUrl: string): Promise<PanelDetectionInput> {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const image = new Image();
    image.src = dataUrl;
    await image.decode();
    canvas.width = image.width;
    canvas.height = image.height;
    ctx?.drawImage(image, 0, 0);
    return {
      image: cv.imread(canvas),
      displayCallback: this.displayCallback
    }
  }
}

export class MatToDataUrlAdapter implements AsyncAdapter<cv.Mat, string> {
  async convert(mat: cv.Mat) {
    const canvas = document.createElement('canvas');
    const { height, width } = mat.size();
    canvas.width = width;
    canvas.height = height;
    cv.imshow(canvas, mat);
    return canvas.toDataURL('image/png');
  }
}