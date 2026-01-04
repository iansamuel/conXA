# Grid Word Arranger

A powerful, accessible web application for arranging words in a 4x4 grid. Features drag-and-drop functionality, OCR text extraction from screenshots, and a rich set of productivity tools.

## ✨ Features

### Core Functionality
- **Interactive 4x4 Grid** - Drag and drop cells to rearrange words
- **Double-click/tap Editing** - Quick inline text editing
- **Auto-save** - Your work is automatically saved to browser storage

### OCR & Text Extraction
- **Screenshot Upload** - Extract text from grid screenshots using OCR
- **Smart Grid Detection** - Automatically detects 4x4 grid layouts using k-means clustering
- **Multi-word Cell Support** - Handles cells with multiple words
- **Image Validation** - Validates file types and sizes before processing

### Productivity Tools
- **Export/Import** - Save and load grids as JSON files
- **Copy to Clipboard** - Copy all grid text with one click
- **URL Sharing** - Share grids via encoded URLs
- **Print Support** - Print-optimized layout
- **Undo/Redo** - Up to 50 actions with Ctrl+Z / Ctrl+Shift+Z

### User Experience
- **Dark Mode** - Toggle between light and dark themes
- **Keyboard Navigation** - Full keyboard support with arrow keys
- **Toast Notifications** - Clear feedback for all actions
- **Help System** - Built-in tutorial and keyboard shortcuts guide
- **Haptic Feedback** - Vibration feedback on mobile devices (where supported)

### Accessibility
- **ARIA Labels** - Full screen reader support
- **Keyboard Accessible** - Navigate and edit without a mouse
- **High Contrast Support** - Works with high contrast mode
- **Reduced Motion** - Respects user's motion preferences
- **Focus Indicators** - Clear visual focus states

### Performance
- **Lazy Loading** - Tesseract.js loads only when needed
- **Image Caching** - OCR results cached for 15 minutes
- **Optimized Animations** - Smooth, GPU-accelerated transitions
- **Memory Management** - Proper cleanup to prevent memory leaks

## 🚀 Getting Started

### Quick Start

1. Open `index.html` in a modern web browser
2. Start editing cells by double-clicking them
3. Drag cells to rearrange them
4. Upload a screenshot to auto-populate the grid

### For Development

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd conXA
   ```

2. Open with a local server (recommended):
   ```bash
   # Using Python
   python -m http.server 8000

   # Using Node.js
   npx serve

   # Using PHP
   php -S localhost:8000
   ```

3. Navigate to `http://localhost:8000`

### File Structure

```
conXA/
├── index.html          # Main HTML file
├── styles.css          # All styling including dark mode
├── app.js             # Core application logic
├── ocr.js             # OCR processing module
├── README.md          # This file
├── LICENSE            # MIT License
├── package.json       # NPM dependencies and metadata
├── .eslintrc.json     # ESLint configuration
├── .prettierrc        # Prettier configuration
├── .gitignore         # Git ignore rules
└── .gitattributes     # Git attributes
```

## 📖 Usage Guide

### Basic Operations

**Editing Cells:**
- Double-click or double-tap a cell to edit
- Type your text and press Enter or click away to save
- Press Escape to cancel editing

**Rearranging:**
- Click and hold a cell, then drag it to another position
- On mobile: tap and hold, then drag
- Cells will swap positions when dropped

**Keyboard Navigation:**
- Arrow keys to move between cells
- Enter to edit the selected cell
- Tab to move to the next cell
- Escape to cancel editing

### Advanced Features

**OCR Screenshot Upload:**
1. Click "📸 Upload Screenshot"
2. Select an image of a 4x4 grid
3. Wait for processing (progress shown)
4. Grid is automatically populated

**Export/Import:**
- Export: Saves current grid as JSON file
- Import: Load a previously exported grid
- Files include timestamp and version info

**Sharing:**
- Click "🔗 Share" to generate a shareable URL
- URL contains encoded grid state
- Share the URL with others or save it as a bookmark

**Undo/Redo:**
- Ctrl/Cmd + Z to undo
- Ctrl/Cmd + Shift + Z or Ctrl/Cmd + Y to redo
- Up to 50 actions are stored

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| Arrow Keys | Navigate between cells |
| Enter | Edit selected cell |
| Escape | Cancel editing |
| Tab | Move to next cell |
| Ctrl/Cmd + Z | Undo |
| Ctrl/Cmd + Shift + Z | Redo |
| Ctrl/Cmd + Y | Redo (alternative) |

## 🎨 Customization

### Dark Mode
- Click the 🌓 button to toggle dark mode
- Preference is saved to localStorage
- Automatically respects system preference on first visit

### Grid Colors
The grid uses color-coded rows:
- Row 1: Purple gradient
- Row 2: Blue gradient
- Row 3: Yellow gradient
- Row 4: Green gradient

Colors can be customized in `styles.css` by modifying the CSS variables.

## 🔒 Security & Privacy

- **Content Security Policy** - Strict CSP headers prevent XSS attacks
- **File Validation** - Uploaded files are validated for type and size
- **Local Storage Only** - All data stays in your browser
- **No Server** - Completely client-side application
- **No Tracking** - No analytics or third-party tracking

## 🌐 Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

### Required Features
- ES6+ JavaScript
- CSS Grid
- LocalStorage
- Drag and Drop API
- FileReader API
- Web Workers (for OCR)

## 🛠️ Development

### Setup Development Environment

```bash
# Install dependencies
npm install

# Run linter
npm run lint

# Format code
npm run format

# Start development server
npm start
```

### Code Style

- ESLint for JavaScript linting
- Prettier for code formatting
- Comments for complex logic
- Semantic HTML with ARIA labels

### Testing Checklist

- [ ] Grid creation and layout
- [ ] Drag and drop functionality
- [ ] Touch gestures on mobile
- [ ] Edit mode (double-click/tap)
- [ ] Keyboard navigation
- [ ] OCR upload and processing
- [ ] Export/Import functionality
- [ ] Copy to clipboard
- [ ] URL sharing and loading
- [ ] Dark mode toggle
- [ ] Undo/Redo operations
- [ ] LocalStorage persistence
- [ ] Toast notifications
- [ ] Help modal
- [ ] Print layout
- [ ] Accessibility features

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Coding Guidelines

- Follow existing code style
- Add comments for complex logic
- Test on multiple browsers
- Ensure accessibility features work
- Update documentation as needed

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Tesseract.js](https://tesseract.projectnaptha.com/) - OCR engine
- Inspired by word puzzle games
- Built with vanilla JavaScript - no framework dependencies

## 📧 Contact & Support

- Report bugs via GitHub Issues
- Feature requests welcome
- Pull requests appreciated

## 🗺️ Roadmap

Future enhancements being considered:

- [ ] Multiple grid sizes (3x3, 5x5, etc.)
- [ ] Custom color themes
- [ ] Download grid as image
- [ ] Collaborative editing via WebRTC
- [ ] Import from CSV/Excel
- [ ] Custom fonts and styling
- [ ] Grid templates
- [ ] Search within grid
- [ ] Filter and sort cells
- [ ] Statistics (word count, character count)

## 📊 Version History

### v2.0.0 (Current)
- Complete rewrite with modular architecture
- Added OCR functionality
- Added dark mode
- Added undo/redo
- Added keyboard navigation
- Added accessibility features
- Added export/import
- Added URL sharing
- Improved mobile support
- Added comprehensive documentation

### v1.0.0
- Initial release
- Basic 4x4 grid
- Drag and drop
- Inline editing
- Color-coded rows

---

Made with ❤️ using vanilla JavaScript
