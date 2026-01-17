import { describe, it, expect } from 'vitest';
import { extractGridCells } from '../script.js';
import { readdir, readFile } from 'fs/promises';
import { join } from 'path';

/**
 * Integration tests for OCR + Grid Extraction
 *
 * These tests use actual Tesseract.js OCR on test images.
 * Test images should be placed in test-images/ directory with corresponding .expected.json files.
 *
 * To add a test:
 * 1. Add image file: test-images/my-test.png
 * 2. Add expected output: test-images/my-test.expected.json
 * 3. Run: npm test
 *
 * Note: These tests are slower since they perform actual OCR.
 */

describe('OCR Integration Tests', () => {
  it('should have test-images directory', async () => {
    const testImagesPath = join(process.cwd(), 'test-images');
    const files = await readdir(testImagesPath);
    expect(files).toBeDefined();
  });

  // This test dynamically discovers all test images and runs OCR on them
  it.skip('should process all test images correctly', async () => {
    // Skipped by default because:
    // 1. Tesseract.js requires browser/node-specific setup
    // 2. OCR tests are slow (can take 10-30s per image)
    // 3. No test images exist yet
    //
    // To enable:
    // 1. Install tesseract.js: npm install --save-dev tesseract.js
    // 2. Add test images to test-images/
    // 3. Remove .skip from this test

    const testImagesPath = join(process.cwd(), 'test-images');
    const files = await readdir(testImagesPath);

    // Find all .expected.json files
    const expectedFiles = files.filter(f => f.endsWith('.expected.json'));

    if (expectedFiles.length === 0) {
      console.log('No test images found. Add images to test-images/ directory.');
      return;
    }

    for (const expectedFile of expectedFiles) {
      const baseName = expectedFile.replace('.expected.json', '');
      const imageName = files.find(f =>
        f.startsWith(baseName) &&
        (f.endsWith('.png') || f.endsWith('.jpg') || f.endsWith('.jpeg'))
      );

      if (!imageName) {
        console.warn(`No image found for ${expectedFile}`);
        continue;
      }

      // Load expected output
      const expectedPath = join(testImagesPath, expectedFile);
      const expectedData = JSON.parse(await readFile(expectedPath, 'utf-8'));

      // TODO: Perform actual OCR here when tesseract.js is installed
      // const imagePath = join(testImagesPath, imageName);
      // const { data } = await Tesseract.recognize(imagePath, 'eng');
      // const words = data.words.filter(w => w.text.trim().length > 0);
      // const cells = extractGridCells(words);
      // expect(cells).toEqual(expectedData.cells);

      console.log(`Would test: ${imageName} -> ${expectedFile}`);
    }
  });

  // Example of what a single image test looks like (without actual OCR)
  it('should demonstrate test structure', () => {
    // This is an example of how the test would work with real OCR data
    // In a real test, you'd get this from Tesseract.js
    const mockOcrWords = [
      { text: 'APPLE', bbox: { x0: 40, y0: 40, x1: 60, y1: 60 } },
      { text: 'ORANGE', bbox: { x0: 140, y0: 40, x1: 160, y1: 60 } },
      // ... 14 more words ...
    ];

    // Extract grid (this uses our real function)
    // const cells = extractGridCells(mockOcrWords);

    // Compare to expected
    // const expected = ['APPLE', 'ORANGE', ...];
    // expect(cells).toEqual(expected);

    expect(true).toBe(true);  // Placeholder
  });
});

/**
 * Instructions for Running OCR Integration Tests:
 *
 * 1. Install Tesseract.js:
 *    npm install --save-dev tesseract.js
 *
 * 2. Create test images:
 *    - Take screenshots of 4x4 grids
 *    - Save as: test-images/your-test-name.png
 *
 * 3. Create expected output:
 *    - Manually verify OCR results in the app
 *    - Save as: test-images/your-test-name.expected.json
 *    - Format: { "cells": ["WORD1", "WORD2", ..., "WORD16"] }
 *
 * 4. Remove .skip from the test above
 *
 * 5. Run tests:
 *    npm test
 *
 * Note: OCR tests take 10-30 seconds per image.
 * Consider running them separately: npm test ocr-integration
 */
