import * as cv from "@techstark/opencv-js";
import { Adapter } from "../adapter";
import { Box, OpenCVUtils } from "./utils";

// adapted from https://gist.github.com/b10011/bf07887e67d0fb272f70948f23d66102

// Input/Output interfaces for the adapter
export interface PanelDetectionInput {
  image: cv.Mat;
  minPanelArea?: number;
  displayCallback?: (image: cv.Mat) => void;
}

export interface PanelDetectionOutput {
  panels: cv.Mat[];
}

export class GrayColorizer implements Adapter<PanelDetectionInput, PanelDetectionInput> {
  convert(input: PanelDetectionInput): PanelDetectionInput {
    const { image, displayCallback } = input;
    const grayImage = new cv.Mat();
    cv.cvtColor(image, grayImage, cv.COLOR_BGR2GRAY);
    return { image: grayImage, displayCallback };
  }
}

// Panel Detection Adapter implementation
export class PanelDetectionAdapter implements Adapter<PanelDetectionInput, PanelDetectionOutput> {
  convert(input: PanelDetectionInput): PanelDetectionOutput {
    const { image, minPanelArea = 10000, displayCallback } = input;
    
    // Allocate output objects
    const panels: cv.Mat[] = [];
    
    // Threshold the image using OTSU's method
    const mask = new cv.Mat();
    cv.threshold(image, mask, 0, 255, cv.THRESH_BINARY_INV | cv.THRESH_OTSU);

    // Find all external edges of contours
    const contours = new cv.MatVector();
    const hierarchy = new cv.Mat();
    cv.findContours(mask, contours, hierarchy, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_NONE);

    // Create mask of combined contour exteriors
    const contourMask = cv.Mat.zeros(mask.rows, mask.cols, cv.CV_8UC1);
    for (let i = 0; i < contours.size(); i++) {
      cv.drawContours(contourMask, contours, i, new cv.Scalar(255), -1);
    }

    for (let i = 0; i < contours.size(); i++) {
      // Skip small contours like page numbers
      const area = cv.contourArea(contours.get(i));
      if (area > minPanelArea) {
        // Find minimum area rectangle that fits the panels
        const rect = cv.minAreaRect(contours.get(i));

        // Extract points from the matrix
        const box = OpenCVUtils.rectToBox(rect);
        
        // Transform panel and add to results
        const transformedPanel = OpenCVUtils.transformPanel(image, box);
        panels.push(transformedPanel);
      }
    }

    // Clean up temporary objects
    hierarchy.delete();
    contours.delete();
    contourMask.delete();

    // Return the results
    return { panels };
  }
}