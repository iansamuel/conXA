# conXA - Grid Word Arranger

## Project Overview

A single-page web application that provides an interactive 4x4 grid for arranging words with OCR (Optical Character Recognition) capabilities. Users can upload screenshots, automatically extract text using OCR, and then rearrange words by dragging and dropping.

## Tech Stack

- **Frontend**: Pure HTML, CSS, and JavaScript (no frameworks)
- **OCR Library**: Tesseract.js v5 (via CDN)
- **Architecture**: Three-file application (HTML, CSS, JavaScript)

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
- **Clipboard Paste**:
  - Desktop: Paste images directly with Ctrl+V/Cmd+V
  - Mobile: "Paste from Clipboard" button (shown only if Clipboard API is supported)
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

### Clipboard Paste (lines 267-308)
- **Desktop**: Document-level `paste` event listener captures Ctrl+V/Cmd+V
- **Mobile**: Conditional button using Clipboard API (`navigator.clipboard.read()`)
- **Image Detection**: Checks clipboard items for image MIME types
- **Shared Processing**: Uses common `processImageFile()` function for both upload and paste

## File Structure

```
conXA/
├── .git/               # Git repository
├── index.html          # HTML structure (26 lines)
├── styles.css          # All styling (211 lines)
├── script.js           # All JavaScript logic (357 lines)
└── CLAUDE.MD           # Project documentation
```

## Recent Development History

- **Latest**: Added clipboard image paste support for desktop (Ctrl+V) and mobile (button with Clipboard API) (commit 2010f00)
- **Refactoring**: Split single-file app into HTML, CSS, and JS files (commit 0758729)
- **OCR Improvements**: K-means clustering for robust grid detection
- **Multi-word Support**: Spatial analysis for cells with multiple words
- **Mobile UX**: Dynamic Island spacing and color-coded rows

## Development Considerations

### When Making Changes:
1. **Separated Files**: HTML structure in `index.html`, all styles in `styles.css`, all logic in `script.js`
2. **No Build Process**: Direct browser execution, no compilation needed
3. **Mobile-First**: Test both desktop and mobile interactions
4. **OCR Testing**: Use real screenshot images of 4x4 grids to validate OCR accuracy

### File Responsibilities:
- **index.html**: Minimal HTML structure, imports CSS/JS, contains markup and paste button
- **styles.css**: All styling including grid layout, colors, responsive design, mobile optimizations
- **script.js**: Grid creation, drag/drop handlers, touch handlers, edit mode, OCR functionality, clipboard paste, k-means clustering

### Common Modification Areas:
- **Grid Styling**: `styles.css` - colors, sizing, responsive behavior, media queries
- **OCR Algorithm**: `script.js` (extractGridCells, clusterInto4 functions) - clustering, cell detection
- **Clipboard Paste**: `script.js` (paste event listener, pasteBtn handler, processImageFile function) - image pasting
- **Drag/Drop Logic**: `script.js` (addDnDHandlers, handleDrag* functions) - desktop handlers
- **Touch Handlers**: `script.js` (addTouchHandlers function) - mobile drag/drop
- **Edit Mode**: `script.js` (enterEditMode, addEditHandlers functions) - text editing

### Known Constraints:
- Requires 16 cells (4x4 grid) - hardcoded layout
- OCR designed specifically for 4x4 grid detection
- Tesseract.js loaded from CDN (requires internet connection)
- K-means clustering assumes roughly equal spacing between rows/columns

## Testing Scenarios

1. **Desktop**: Test drag-and-drop, double-click edit, screenshot upload, Ctrl+V paste
2. **Mobile**: Test touch drag, double-tap edit, responsive layout, clipboard paste button
3. **OCR**: Upload/paste various 4x4 grid screenshots with different fonts/spacing
4. **Clipboard**: Test paste on different browsers (Chrome, Firefox, Safari), test with no image in clipboard
5. **Edge Cases**: Empty cells, multi-word cells, rotated text, poor image quality

## Browser Compatibility

- Modern browsers with ES6+ support
- HTML5 Drag and Drop API
- Touch Events API
- Clipboard API (for paste button on mobile)
- CSS Grid and Flexbox
- Safe area insets (iOS)
