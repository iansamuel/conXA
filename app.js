/**
 * Grid Word Arranger - Main Application Logic
 */

class GridWordArranger {
    constructor() {
        this.grid = document.getElementById('grid');
        this.dragSrcEl = null;
        this.touchDragEl = null;
        this.lastTap = 0;
        this.history = [];
        this.historyIndex = -1;
        this.maxHistory = 50;
        this.focusedSquare = null;
        this.focusedIndex = 0;

        this.init();
    }

    init() {
        this.createGrid();
        this.loadFromStorage();
        this.loadFromURL();
        this.setupKeyboardNavigation();
        this.setupDarkMode();
        this.setupEventListeners();
        this.showFirstTimeHelp();
        this.saveState(); // Initial state
    }

    // Grid Creation
    createGrid() {
        for (let i = 1; i <= 16; i++) {
            const square = document.createElement('div');
            square.classList.add('square');
            square.setAttribute('draggable', 'true');
            square.setAttribute('tabindex', '0');
            square.setAttribute('role', 'button');
            square.setAttribute('aria-label', `Cell ${i}, row ${Math.floor((i-1)/4)+1}, column ${((i-1)%4)+1}`);
            square.setAttribute('data-position', i);
            square.textContent = '';

            this.addDnDHandlers(square);
            this.addTouchHandlers(square);
            this.addEditHandlers(square);

            this.grid.appendChild(square);
        }
    }

    // Drag and Drop Logic
    addDnDHandlers(elem) {
        elem.addEventListener('dragstart', this.handleDragStart.bind(this));
        elem.addEventListener('dragenter', this.handleDragEnter.bind(this));
        elem.addEventListener('dragover', this.handleDragOver.bind(this));
        elem.addEventListener('dragleave', this.handleDragLeave.bind(this));
        elem.addEventListener('drop', this.handleDrop.bind(this));
        elem.addEventListener('dragend', this.handleDragEnd.bind(this));
    }

    handleDragStart(e) {
        this.dragSrcEl = e.target;
        e.target.style.opacity = '0.4';
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/html', e.target.innerHTML);
        e.target.classList.add('dragging');
    }

    handleDragOver(e) {
        if (e.preventDefault) {
            e.preventDefault();
        }
        e.dataTransfer.dropEffect = 'move';
        return false;
    }

    handleDragEnter(e) {
        e.target.classList.add('over');
    }

    handleDragLeave(e) {
        e.target.classList.remove('over');
    }

    handleDrop(e) {
        if (e.stopPropagation) {
            e.stopPropagation();
        }

        if (this.dragSrcEl !== e.target) {
            const srcContent = this.dragSrcEl.textContent;
            const targetContent = e.target.textContent;

            this.dragSrcEl.textContent = targetContent;
            e.target.textContent = srcContent;

            this.saveState();
            this.saveToStorage();
            this.triggerHaptic();
        }
        return false;
    }

    handleDragEnd(e) {
        e.target.style.opacity = '1';
        e.target.classList.remove('dragging');

        document.querySelectorAll('.square').forEach(item => {
            item.classList.remove('over');
        });
    }

    // Touch Event Handlers
    addTouchHandlers(elem) {
        let touchStartTime = 0;
        let touchStartPos = null;

        elem.addEventListener('touchstart', (e) => {
            touchStartTime = Date.now();
            const touch = e.touches[0];
            touchStartPos = { x: touch.clientX, y: touch.clientY };

            const currentTime = Date.now();
            const tapLength = currentTime - this.lastTap;
            if (tapLength < 300 && tapLength > 0) {
                e.preventDefault();
                this.enterEditMode(elem);
                this.lastTap = 0;
                return;
            }
            this.lastTap = currentTime;

            setTimeout(() => {
                if (this.touchDragEl === elem) {
                    elem.classList.add('dragging');
                    elem.style.opacity = '0.4';
                }
            }, 150);

            this.touchDragEl = elem;
        });

        elem.addEventListener('touchmove', (e) => {
            if (!this.touchDragEl) return;

            e.preventDefault();
            const touch = e.touches[0];
            const elemBelow = document.elementFromPoint(touch.clientX, touch.clientY);

            document.querySelectorAll('.square').forEach(sq => sq.classList.remove('over'));

            if (elemBelow && elemBelow.classList.contains('square') && elemBelow !== this.touchDragEl) {
                elemBelow.classList.add('over');
            }
        });

        elem.addEventListener('touchend', (e) => {
            if (!this.touchDragEl) return;

            const touch = e.changedTouches[0];
            const elemBelow = document.elementFromPoint(touch.clientX, touch.clientY);

            if (elemBelow && elemBelow.classList.contains('square') && elemBelow !== this.touchDragEl) {
                const tempContent = this.touchDragEl.textContent;
                this.touchDragEl.textContent = elemBelow.textContent;
                elemBelow.textContent = tempContent;

                this.saveState();
                this.saveToStorage();
                this.triggerHaptic();
            }

            elem.style.opacity = '1';
            elem.classList.remove('dragging');
            document.querySelectorAll('.square').forEach(sq => sq.classList.remove('over'));

            this.touchDragEl = null;
        });
    }

    // Edit Logic
    enterEditMode(elem) {
        elem.setAttribute('draggable', 'false');

        const currentText = elem.textContent;
        const input = document.createElement('input');
        input.type = 'text';
        input.value = currentText;
        input.classList.add('edit-input');
        input.setAttribute('aria-label', 'Edit cell content');

        elem.textContent = '';
        elem.appendChild(input);
        input.focus();
        input.select();

        const save = () => {
            const newText = input.value.trim();
            elem.textContent = newText;
            elem.setAttribute('draggable', 'true');
            this.saveState();
            this.saveToStorage();
        };

        input.addEventListener('blur', save);
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                save();
            }
        });
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                elem.textContent = currentText;
                elem.setAttribute('draggable', 'true');
            }
        });
    }

    addEditHandlers(elem) {
        elem.addEventListener('dblclick', () => {
            this.enterEditMode(elem);
        });

        elem.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                this.enterEditMode(elem);
            }
        });
    }

    // Keyboard Navigation
    setupKeyboardNavigation() {
        document.addEventListener('keydown', (e) => {
            // Check if we're editing
            if (document.activeElement.classList.contains('edit-input')) {
                return;
            }

            const squares = Array.from(document.querySelectorAll('.square'));
            let currentIndex = squares.indexOf(document.activeElement);

            if (currentIndex === -1 && this.focusedSquare) {
                currentIndex = squares.indexOf(this.focusedSquare);
            }

            if (currentIndex === -1) {
                currentIndex = 0;
            }

            let newIndex = currentIndex;

            switch(e.key) {
                case 'ArrowRight':
                    e.preventDefault();
                    newIndex = currentIndex % 4 === 3 ? currentIndex : currentIndex + 1;
                    break;
                case 'ArrowLeft':
                    e.preventDefault();
                    newIndex = currentIndex % 4 === 0 ? currentIndex : currentIndex - 1;
                    break;
                case 'ArrowDown':
                    e.preventDefault();
                    newIndex = currentIndex + 4 < 16 ? currentIndex + 4 : currentIndex;
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    newIndex = currentIndex - 4 >= 0 ? currentIndex - 4 : currentIndex;
                    break;
                case 'Tab':
                    // Let default tab behavior work
                    return;
                case 'z':
                    if (e.ctrlKey || e.metaKey) {
                        e.preventDefault();
                        if (e.shiftKey) {
                            this.redo();
                        } else {
                            this.undo();
                        }
                    }
                    break;
                case 'y':
                    if (e.ctrlKey || e.metaKey) {
                        e.preventDefault();
                        this.redo();
                    }
                    break;
            }

            if (newIndex !== currentIndex) {
                squares[newIndex].focus();
                this.focusedSquare = squares[newIndex];
                this.focusedIndex = newIndex;
            }
        });
    }

    // State Management
    saveState() {
        const state = this.getGridState();

        // Remove any states after current position (when new action after undo)
        this.history = this.history.slice(0, this.historyIndex + 1);

        this.history.push(state);

        // Limit history size
        if (this.history.length > this.maxHistory) {
            this.history.shift();
        } else {
            this.historyIndex++;
        }
    }

    undo() {
        if (this.historyIndex > 0) {
            this.historyIndex--;
            this.restoreState(this.history[this.historyIndex]);
            this.saveToStorage();
            this.showToast('Undo successful', 'success');
        } else {
            this.showToast('Nothing to undo', 'warning');
        }
    }

    redo() {
        if (this.historyIndex < this.history.length - 1) {
            this.historyIndex++;
            this.restoreState(this.history[this.historyIndex]);
            this.saveToStorage();
            this.showToast('Redo successful', 'success');
        } else {
            this.showToast('Nothing to redo', 'warning');
        }
    }

    getGridState() {
        const squares = document.querySelectorAll('.square');
        return Array.from(squares).map(sq => sq.textContent);
    }

    restoreState(state) {
        const squares = document.querySelectorAll('.square');
        squares.forEach((sq, i) => {
            sq.textContent = state[i] || '';
        });
    }

    // LocalStorage
    saveToStorage() {
        try {
            const state = this.getGridState();
            localStorage.setItem('gridWordArranger_state', JSON.stringify(state));
            localStorage.setItem('gridWordArranger_timestamp', Date.now().toString());
        } catch (error) {
            console.error('Failed to save to localStorage:', error);
        }
    }

    loadFromStorage() {
        try {
            const saved = localStorage.getItem('gridWordArranger_state');
            if (saved) {
                const state = JSON.parse(saved);
                this.restoreState(state);
            }
        } catch (error) {
            console.error('Failed to load from localStorage:', error);
        }
    }

    // Export/Import
    exportToJSON() {
        const state = this.getGridState();
        const data = {
            version: '1.0',
            timestamp: new Date().toISOString(),
            grid: state
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `grid-${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);

        this.showToast('Grid exported successfully', 'success');
    }

    importFromJSON(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                if (data.grid && Array.isArray(data.grid)) {
                    this.restoreState(data.grid);
                    this.saveState();
                    this.saveToStorage();
                    this.showToast('Grid imported successfully', 'success');
                } else {
                    this.showToast('Invalid file format', 'error');
                }
            } catch (error) {
                this.showToast('Failed to import file', 'error');
                console.error('Import error:', error);
            }
        };
        reader.readAsText(file);
    }

    // Copy to Clipboard
    copyToClipboard() {
        const state = this.getGridState();
        const text = state.filter(s => s).join('\n');

        if (!text) {
            this.showToast('Grid is empty', 'warning');
            return;
        }

        navigator.clipboard.writeText(text).then(() => {
            this.showToast('Copied to clipboard', 'success');
        }).catch(() => {
            // Fallback for older browsers
            const textarea = document.createElement('textarea');
            textarea.value = text;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
            this.showToast('Copied to clipboard', 'success');
        });
    }

    // Reset Grid
    resetGrid() {
        if (confirm('Are you sure you want to reset the grid? This cannot be undone.')) {
            this.restoreState(Array(16).fill(''));
            this.saveState();
            this.saveToStorage();
            this.showToast('Grid reset', 'success');
        }
    }

    // URL Sharing
    getShareURL() {
        const state = this.getGridState();
        const compressed = btoa(JSON.stringify(state));
        const url = new URL(window.location.href);
        url.searchParams.set('grid', compressed);
        return url.toString();
    }

    loadFromURL() {
        const params = new URLSearchParams(window.location.search);
        const gridData = params.get('grid');

        if (gridData) {
            try {
                const state = JSON.parse(atob(gridData));
                this.restoreState(state);
                this.saveState();
                this.showToast('Grid loaded from URL', 'success');
            } catch (error) {
                console.error('Failed to load from URL:', error);
                this.showToast('Invalid URL data', 'error');
            }
        }
    }

    shareURL() {
        const url = this.getShareURL();

        if (navigator.share) {
            navigator.share({
                title: 'Grid Word Arranger',
                url: url
            }).then(() => {
                this.showToast('Shared successfully', 'success');
            }).catch(() => {
                this.copyURLToClipboard(url);
            });
        } else {
            this.copyURLToClipboard(url);
        }
    }

    copyURLToClipboard(url) {
        navigator.clipboard.writeText(url).then(() => {
            this.showToast('Share link copied to clipboard', 'success');
        }).catch(() => {
            this.showToast('Failed to copy link', 'error');
        });
    }

    // Dark Mode
    setupDarkMode() {
        const savedTheme = localStorage.getItem('gridWordArranger_theme');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

        if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
            document.documentElement.setAttribute('data-theme', 'dark');
        }
    }

    toggleDarkMode() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('gridWordArranger_theme', newTheme);

        this.showToast(`${newTheme === 'dark' ? 'Dark' : 'Light'} mode enabled`, 'success');
    }

    // Toast Notifications
    showToast(message, type = 'info') {
        const container = document.querySelector('.toast-container') || this.createToastContainer();

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <span>${this.getToastIcon(type)}</span>
            <span>${message}</span>
        `;

        container.appendChild(toast);

        setTimeout(() => {
            toast.style.animation = 'slideIn 0.3s ease-out reverse';
            setTimeout(() => {
                container.removeChild(toast);
            }, 300);
        }, 3000);
    }

    createToastContainer() {
        const container = document.createElement('div');
        container.className = 'toast-container';
        document.body.appendChild(container);
        return container;
    }

    getToastIcon(type) {
        const icons = {
            success: '✓',
            error: '✗',
            warning: '⚠',
            info: 'ℹ'
        };
        return icons[type] || icons.info;
    }

    // Haptic Feedback
    triggerHaptic() {
        if (navigator.vibrate) {
            navigator.vibrate(10);
        }
    }

    // Help Modal
    showFirstTimeHelp() {
        const hasSeenHelp = localStorage.getItem('gridWordArranger_hasSeenHelp');
        if (!hasSeenHelp) {
            setTimeout(() => {
                this.showHelp();
                localStorage.setItem('gridWordArranger_hasSeenHelp', 'true');
            }, 500);
        }
    }

    showHelp() {
        const modal = document.getElementById('helpModal');
        if (modal) {
            modal.classList.add('active');
        }
    }

    hideHelp() {
        const modal = document.getElementById('helpModal');
        if (modal) {
            modal.classList.remove('active');
        }
    }

    // Event Listeners Setup
    setupEventListeners() {
        // Upload button
        const uploadBtn = document.getElementById('imageUpload');
        if (uploadBtn) {
            uploadBtn.addEventListener('change', (e) => {
                if (window.ocrProcessor) {
                    window.ocrProcessor.handleImageUpload(e);
                }
            });
        }

        // Export button
        const exportBtn = document.getElementById('exportBtn');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => this.exportToJSON());
        }

        // Import button
        const importBtn = document.getElementById('importBtn');
        const importInput = document.getElementById('importFile');
        if (importBtn && importInput) {
            importBtn.addEventListener('click', () => importInput.click());
            importInput.addEventListener('change', (e) => {
                if (e.target.files[0]) {
                    this.importFromJSON(e.target.files[0]);
                    e.target.value = '';
                }
            });
        }

        // Copy button
        const copyBtn = document.getElementById('copyBtn');
        if (copyBtn) {
            copyBtn.addEventListener('click', () => this.copyToClipboard());
        }

        // Reset button
        const resetBtn = document.getElementById('resetBtn');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => this.resetGrid());
        }

        // Share button
        const shareBtn = document.getElementById('shareBtn');
        if (shareBtn) {
            shareBtn.addEventListener('click', () => this.shareURL());
        }

        // Dark mode button
        const darkModeBtn = document.getElementById('darkModeBtn');
        if (darkModeBtn) {
            darkModeBtn.addEventListener('click', () => this.toggleDarkMode());
        }

        // Help button
        const helpBtn = document.getElementById('helpBtn');
        if (helpBtn) {
            helpBtn.addEventListener('click', () => this.showHelp());
        }

        // Close modal
        const closeModal = document.getElementById('closeModal');
        if (closeModal) {
            closeModal.addEventListener('click', () => this.hideHelp());
        }

        const modalOverlay = document.getElementById('helpModal');
        if (modalOverlay) {
            modalOverlay.addEventListener('click', (e) => {
                if (e.target === modalOverlay) {
                    this.hideHelp();
                }
            });
        }

        // Auto-save on window unload
        window.addEventListener('beforeunload', () => {
            this.saveToStorage();
        });

        // Print functionality
        const printBtn = document.getElementById('printBtn');
        if (printBtn) {
            printBtn.addEventListener('click', () => {
                window.print();
            });
        }
    }

    // Download as Image
    async downloadAsImage() {
        // This would require html2canvas or similar library
        this.showToast('Image download coming soon', 'info');
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.gridApp = new GridWordArranger();
});
