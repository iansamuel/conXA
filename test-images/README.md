# Test Images

This directory contains test images for integration testing of the OCR grid extraction feature.

## Structure

For each test image, create:
1. An image file (e.g., `perfect-grid.png`)
2. A corresponding JSON file with expected output (e.g., `perfect-grid.expected.json`)

## Expected Output Format

The expected output JSON should contain an array of 16 cells representing the grid content in row-major order (left-to-right, top-to-bottom).

Example `perfect-grid.expected.json`:
```json
{
  "cells": [
    "APPLE", "ORANGE", "BANANA", "GRAPE",
    "CAT", "DOG", "FISH", "BIRD",
    "RED", "BLUE", "GREEN", "YELLOW",
    "NORTH", "SOUTH", "EAST", "WEST"
  ]
}
```

## Adding Test Images

1. Take a screenshot of a 4x4 grid
2. Save it with a descriptive name (e.g., `multi-word-cells.png`)
3. Manually verify the OCR output by testing in the app
4. Create a `.expected.json` file with the correct cell values
5. The integration test will automatically detect and test all image/json pairs

## Test Cases to Cover

- ✓ Perfect grid with single words
- ✓ Grid with multi-word cells (e.g., "NEW YORK")
- ✓ Grid with some empty cells
- ✓ Grid with uneven spacing
- ✓ Grid with various font sizes
- ✓ Grid with different colors/backgrounds
- ✓ Blurry or low-quality images (expect failure)

## Example Test Images Needed

1. `perfect-grid.png` - Ideal grid with 16 single-word cells
2. `multi-word.png` - Grid with compound words like "FISH TANK"
3. `connections-screenshot.png` - Real screenshot from NY Times Connections game
4. `empty-cells.png` - Grid with some blank squares
5. `uneven-spacing.png` - Grid with irregular cell spacing
