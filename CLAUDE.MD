# conXA - Grid Word Arranger

## Project Overview

A single-page web application that provides an interactive 4x4 grid for arranging words with OCR (Optical Character Recognition) capabilities. Users can upload screenshots, automatically extract text using OCR, and then rearrange words by dragging and dropping.

## Tech Stack

- **Frontend**: Pure HTML, CSS, and JavaScript (no frameworks)
- **OCR Library**: Tesseract.js v5 (via CDN)
- **Architecture**: Single-file application (`index.html`)

## Core Features

### 1. Interactive 4x4 Grid
- **Drag & Drop**: Desktop support for rearranging grid cells
- **Touch Support**: Mobile-optimized with touch event handlers
- **Color-Coded Rows**:
  - Row 1 (Purple): Cells 1-4
  - Row 2 (Blue): Cells 5-8
  - Row 3 (Yellow): Cells 9-12
  - Row 4 (Green): Cells 13-16
- **Editable Cells**: Double-click (desktop) or double-tap (mobile) to edit text

### 2. OCR Functionality
- **Screenshot Upload**: Users can upload images containing a 4x4 grid of text
- **Text Extraction**: Tesseract.js extracts words with bounding box coordinates
- **Smart Grid Detection**: K-means clustering algorithm (lines 530-593) automatically:
  - Identifies 4 row centers from word Y-coordinates
  - Identifies 4 column centers from word X-coordinates
  - Assigns words to the correct grid cell based on spatial position
  - Handles multi-word cells by combining words in the same cell

### 3. Mobile Optimization
- **Responsive Design**: Adapts to various screen sizes using CSS clamp()
- **Safe Area Insets**: Respects iOS notch/Dynamic Island
- **Touch-Friendly**: Minimum 44px touch targets
- **Viewport Optimizations**: Special handling for screens with max-height < 600px

## Key Implementation Details

### Drag & Drop System (lines 259-318)
- Uses HTML5 Drag and Drop API
- Swaps innerHTML content between source and target squares
- Visual feedback with opacity changes and dashed borders

### Touch Event Handling (lines 320-389)
- Custom touch handlers for mobile devices
- 150ms delay before drag activation to distinguish from scrolling
- Double-tap detection with 300ms threshold for edit mode
- Uses `document.elementFromPoint()` to detect drop targets

### OCR Grid Extraction (lines 490-593)
- **Word Center Calculation**: Averages bounding box coordinates
- **K-means Clustering**: Iterative algorithm (10 iterations) to find optimal row/column centers
- **Cell Assignment**: Maps each word to nearest grid cell using cluster distances
- **Multi-word Support**: Combines multiple words within the same cell with spaces

### Edit Mode (lines 391-426)
- Temporarily disables dragging during text editing
- Creates inline input field with current text
- Saves on blur or Enter key press
- Re-enables dragging after save

## File Structure

```
conXA/
├── .git/               # Git repository
└── index.html         # Main application (single file, ~600 lines)
```

## Recent Development History

- **Latest**: Reverted major refactor (commit c940478)
- **OCR Improvements**: K-means clustering for robust grid detection (commit 67afd6c)
- **Multi-word Support**: Spatial analysis for cells with multiple words (commit 0ade4e5)
- **Mobile UX**: Dynamic Island spacing and color-coded rows

## Development Considerations

### When Making Changes:
1. **Single File Architecture**: All code is in `index.html` - CSS in `<style>`, JS in `<script>`
2. **No Build Process**: Direct browser execution, no compilation needed
3. **Mobile-First**: Test both desktop and mobile interactions
4. **OCR Testing**: Use real screenshot images of 4x4 grids to validate OCR accuracy

### Common Modification Areas:
- **Grid Styling**: CSS lines 81-220 (colors, sizing, responsive behavior)
- **OCR Algorithm**: JavaScript lines 490-593 (clustering, cell detection)
- **Drag/Drop Logic**: JavaScript lines 259-389 (desktop and mobile handlers)
- **Edit Mode**: JavaScript lines 391-426 (text editing functionality)

### Known Constraints:
- Requires 16 cells (4x4 grid) - hardcoded layout
- OCR designed specifically for 4x4 grid detection
- Tesseract.js loaded from CDN (requires internet connection)
- K-means clustering assumes roughly equal spacing between rows/columns

## Testing Scenarios

1. **Desktop**: Test drag-and-drop, double-click edit, screenshot upload
2. **Mobile**: Test touch drag, double-tap edit, responsive layout
3. **OCR**: Upload various 4x4 grid screenshots with different fonts/spacing
4. **Edge Cases**: Empty cells, multi-word cells, rotated text, poor image quality

## Browser Compatibility

- Modern browsers with ES6+ support
- HTML5 Drag and Drop API
- Touch Events API
- CSS Grid and Flexbox
- Safe area insets (iOS)
