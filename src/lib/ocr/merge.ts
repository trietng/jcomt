import { Block } from "tesseract.js";
import { CanvasBlock, MergedBlock } from "./models";

/**
 * Determines if two blocks are in the same column based on horizontal overlap
 * 
 * @param block1 - First OCR block
 * @param block2 - Second OCR block
 * @param overlapThreshold - Minimum overlap ratio required (0-1)
 * @returns Boolean indicating if blocks are in the same column
 */
function areInSameColumn(block1: Block, block2: Block, overlapThreshold: number = 0.5): boolean {
  // Calculate horizontal overlap
  const overlapStart = Math.max(block1.bbox.x0, block2.bbox.x0);
  const overlapEnd = Math.min(block1.bbox.x1, block2.bbox.x1);
  
  if (overlapEnd <= overlapStart) {
    return false; // No overlap
  }
  
  const overlapWidth = overlapEnd - overlapStart;
  const width1 = block1.bbox.x1 - block1.bbox.x0;
  const width2 = block2.bbox.x1 - block2.bbox.x0;
  
  // Calculate overlap ratio against the narrower of the two blocks
  const minWidth = Math.min(width1, width2);
  const overlapRatio = overlapWidth / minWidth;
  
  return overlapRatio >= overlapThreshold;
}

function toCanvasBlocks(blocks: MergedBlock[], scale: number = 1.4): CanvasBlock[] {
  return blocks.map((block) => {
    const width = (block.bbox.x1 - block.bbox.x0) * scale;
    const height = (block.bbox.y1 - block.bbox.y0) * scale;
    const left = block.bbox.x0 - ((width - (block.bbox.x1 - block.bbox.x0)) / 2);
    const top = block.bbox.y0 - ((height - (block.bbox.y1 - block.bbox.y0)) / 2);
    return {
      text: block.text,
      box: {
        top,
        left,
        width,
        height
      }
    }
  });
}

/**
 * Merges OCR text blocks that are in the same column and close vertically
 * 
 * @param ocrData - Array of OCR blocks with bounding box and text information
 * @param verticalDistanceThreshold - Maximum vertical distance between blocks to be merged (in pixels)
 * @param overlapThreshold - Minimum horizontal overlap ratio to consider blocks in same column
 * @param preserveColumnWidth - Whether to preserve original column width when merging blocks
 * @returns Array of merged text blocks with updated bounding boxes
 */
export function mergeColumnBlocks(
  ocrData: Block[], 
  verticalDistanceThreshold: number = 20, 
  overlapThreshold: number = 0.3,
  preserveColumnWidth: boolean = true
): CanvasBlock[] {
  if (!ocrData || ocrData.length === 0) {
    return [];
  }

  // Create a deep copy of the input data
  const blocks = structuredClone(ocrData);
  
  // Sort blocks by y0 (top coordinate) to process them from top to bottom
  blocks.sort((a, b) => a.bbox.y0 - b.bbox.y0);

  // Keep track of which blocks have been merged
  const mergedIndexes = new Set<number>();
  let result: MergedBlock[] = [];

  for (let i = 0; i < blocks.length; i++) {
    // Skip if this block has already been merged into another block
    if (mergedIndexes.has(i)) {
      continue;
    }

    const currentBlock = { ...blocks[i] };
    let currentText = currentBlock.text;
    let didMerge = false;
    
    // Track the most common x0 and x1 values for column estimation
    const x0Values: number[] = [currentBlock.bbox.x0];
    const x1Values: number[] = [currentBlock.bbox.x1];
    
    // Initialize the y bounds to the current block
    let yMin = currentBlock.bbox.y0;
    let yMax = currentBlock.bbox.y1;

    // Look for blocks to merge with the current block
    for (let j = 0; j < blocks.length; j++) {
      if (i === j || mergedIndexes.has(j)) {
        continue; // Skip self or already merged blocks
      }

      const nextBlock = blocks[j];
      
      // Check if blocks are in the same column
      if (areInSameColumn(currentBlock, nextBlock, overlapThreshold)) {
        // Calculate vertical distance (works for blocks above or below)
        const verticalDistance = 
          nextBlock.bbox.y0 > currentBlock.bbox.y1 
            ? nextBlock.bbox.y0 - currentBlock.bbox.y1 // nextBlock is below
            : currentBlock.bbox.y0 - nextBlock.bbox.y1; // nextBlock is above
        
        // If blocks are close enough vertically
        if (verticalDistance <= verticalDistanceThreshold) {
          // Track x coordinates for column estimation
          x0Values.push(nextBlock.bbox.x0);
          x1Values.push(nextBlock.bbox.x1);
          
          // Update vertical bounds
          yMin = Math.min(yMin, nextBlock.bbox.y0);
          yMax = Math.max(yMax, nextBlock.bbox.y1);

          // Determine if nextBlock is above or below current block
          if (nextBlock.bbox.y0 < currentBlock.bbox.y0) {
            // nextBlock is above, prepend text
            const space = nextBlock.text.endsWith(" ") || currentText.startsWith(" ") ? "" : " ";
            currentText = nextBlock.text + space + currentText;
          } else {
            // nextBlock is below, append text
            const space = currentText.endsWith(" ") || nextBlock.text.startsWith(" ") ? "" : " ";
            currentText = currentText + space + nextBlock.text;
          }
          
          // Mark this block as merged
          mergedIndexes.add(j);
          didMerge = true;
        }
      }
    }

    // Trim
    currentBlock.text = currentText.trim();
    
    // Now update the bounding box based on collected coordinates
    if (preserveColumnWidth && didMerge) {
      // Calculate the most common x0 and x1 values (for consistent column width)
      const getMostCommon = (arr: number[]): number => {
        const counts = arr.reduce((acc, val) => {
          acc[val] = (acc[val] || 0) + 1;
          return acc;
        }, {} as Record<number, number>);
        
        return Number(Object.entries(counts)
          .sort((a, b) => b[1] - a[1])
          .map(([val]) => val)[0]);
      };
      
      // Use the most common x values to maintain column alignment
      // This helps prevent the bounding box from expanding beyond the actual column
      currentBlock.bbox = {
        x0: getMostCommon(x0Values),
        y0: yMin,
        x1: getMostCommon(x1Values),
        y1: yMax
      };
    } else if (didMerge) {
      // Simple min/max approach if we don't care about preserving column width
      currentBlock.bbox = {
        x0: Math.min(...x0Values),
        y0: yMin,
        x1: Math.max(...x1Values),
        y1: yMax
      };
    }
    
    result.push(currentBlock);
    mergedIndexes.add(i);
  }

  // Sort result by top y-coordinate for consistent output
  result = result.sort((a, b) => a.bbox.y0 - b.bbox.y0);

  return toCanvasBlocks(result);
}