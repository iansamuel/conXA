const grid = document.getElementById('grid');
let dragSrcEl = null;
let touchDragEl = null;
let lastTap = 0;

// 1. Initialize Grid
function createGrid() {
    for (let i = 1; i <= 16; i++) {
        const square = document.createElement('div');
        square.classList.add('square');
        square.setAttribute('draggable', 'true');
        square.textContent = "";

        // Add Event Listeners
        addDnDHandlers(square);
        addTouchHandlers(square);
        addEditHandlers(square);

        grid.appendChild(square);
    }
}

// 2. Drag and Drop Logic
function addDnDHandlers(elem) {
    elem.addEventListener('dragstart', handleDragStart);
    elem.addEventListener('dragenter', handleDragEnter);
    elem.addEventListener('dragover', handleDragOver);
    elem.addEventListener('dragleave', handleDragLeave);
    elem.addEventListener('drop', handleDrop);
    elem.addEventListener('dragend', handleDragEnd);
}

function handleDragStart(e) {
    this.style.opacity = '0.4';
    dragSrcEl = this;
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', this.innerHTML);
    this.classList.add('dragging');
}

function handleDragOver(e) {
    if (e.preventDefault) {
        e.preventDefault(); // Necessary to allow dropping
    }
    e.dataTransfer.dropEffect = 'move';
    return false;
}

function handleDragEnter(e) {
    this.classList.add('over');
}

function handleDragLeave(e) {
    this.classList.remove('over');
}

function handleDrop(e) {
    if (e.stopPropagation) {
        e.stopPropagation();
    }

    // Don't do anything if dropping onto the same square
    if (dragSrcEl !== this) {
        // Swap the HTML content (this keeps the style but swaps text)
        // Note: If we had complex internal elements, we would swap nodes instead.
        // For text/inputs, swapping innerHTML is sufficient.
        dragSrcEl.innerHTML = this.innerHTML;
        this.innerHTML = e.dataTransfer.getData('text/html');
    }
    return false;
}

function handleDragEnd(e) {
    this.style.opacity = '1';
    this.classList.remove('dragging');

    // Remove 'over' class from all squares
    let items = document.querySelectorAll('.square');
    items.forEach(function (item) {
        item.classList.remove('over');
    });
}

// 2b. Touch Event Handlers for Mobile
function addTouchHandlers(elem) {
    let touchStartTime = 0;
    let touchStartPos = null;

    elem.addEventListener('touchstart', function(e) {
        touchStartTime = Date.now();
        const touch = e.touches[0];
        touchStartPos = { x: touch.clientX, y: touch.clientY };

        // Check for double-tap to edit
        const currentTime = Date.now();
        const tapLength = currentTime - lastTap;
        if (tapLength < 300 && tapLength > 0) {
            // Double tap detected
            e.preventDefault();
            enterEditMode(this);
            lastTap = 0;
            return;
        }
        lastTap = currentTime;

        // Start drag after a short delay
        setTimeout(() => {
            if (touchDragEl === this) {
                this.classList.add('dragging');
                this.style.opacity = '0.4';
            }
        }, 150);

        touchDragEl = this;
    });

    elem.addEventListener('touchmove', function(e) {
        if (!touchDragEl) return;

        e.preventDefault();
        const touch = e.touches[0];
        const elemBelow = document.elementFromPoint(touch.clientX, touch.clientY);

        // Remove 'over' class from all squares
        document.querySelectorAll('.square').forEach(sq => sq.classList.remove('over'));

        // Add 'over' class to the element below if it's a square
        if (elemBelow && elemBelow.classList.contains('square') && elemBelow !== touchDragEl) {
            elemBelow.classList.add('over');
        }
    });

    elem.addEventListener('touchend', function(e) {
        if (!touchDragEl) return;

        const touch = e.changedTouches[0];
        const elemBelow = document.elementFromPoint(touch.clientX, touch.clientY);

        // Swap content if dropped on another square
        if (elemBelow && elemBelow.classList.contains('square') && elemBelow !== touchDragEl) {
            const tempContent = touchDragEl.innerHTML;
            touchDragEl.innerHTML = elemBelow.innerHTML;
            elemBelow.innerHTML = tempContent;
        }

        // Clean up
        this.style.opacity = '1';
        this.classList.remove('dragging');
        document.querySelectorAll('.square').forEach(sq => sq.classList.remove('over'));

        touchDragEl = null;
    });
}

// 3. Edit Logic (Double Click and Double Tap)
function enterEditMode(elem) {
    // Disable dragging while editing so it doesn't get glitchy
    elem.setAttribute('draggable', 'false');

    const currentText = elem.textContent;
    const input = document.createElement('input');
    input.type = 'text';
    input.value = currentText;
    input.classList.add('edit-input');

    // Clear the square and add input
    elem.textContent = '';
    elem.appendChild(input);
    input.focus();

    // Save on Blur (clicking away) or Enter key
    const save = () => {
        const newText = input.value.trim();
        elem.textContent = newText;
        elem.setAttribute('draggable', 'true'); // Re-enable drag
    };

    input.addEventListener('blur', save);
    input.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            save();
        }
    });
}

function addEditHandlers(elem) {
    elem.addEventListener('dblclick', function() {
        enterEditMode(this);
    });
}

// Run initialization
createGrid();

// 4. OCR Functionality
const imageUpload = document.getElementById('imageUpload');
const statusText = document.getElementById('status');
const pasteBtn = document.getElementById('pasteBtn');

// Shared function to process an image file
async function processImageFile(file) {
    if (!file || !file.type.startsWith('image/')) {
        statusText.textContent = '✗ Please provide a valid image';
        setTimeout(() => statusText.textContent = '', 3000);
        return;
    }

    statusText.textContent = 'Processing image...';

    try {
        const { data } = await Tesseract.recognize(file, 'eng', {
            logger: m => {
                if (m.status === 'recognizing text') {
                    statusText.textContent = `Processing: ${Math.round(m.progress * 100)}%`;
                }
            }
        });

        // Get word-level data with bounding boxes
        const words = data.words.filter(w => w.text.trim().length > 0);

        if (words.length === 0) {
            statusText.textContent = '✗ No text detected';
            setTimeout(() => statusText.textContent = '', 3000);
            return;
        }

        // Group words into 4x4 grid based on spatial position
        const cells = extractGridCells(words);

        // Populate grid
        const squares = document.querySelectorAll('.square');
        squares.forEach((square, index) => {
            if (index < cells.length) {
                square.textContent = cells[index];
            } else {
                square.textContent = '';
            }
        });

        statusText.textContent = `✓ Loaded ${cells.length} cells`;
        setTimeout(() => {
            statusText.textContent = '';
        }, 3000);

    } catch (error) {
        statusText.textContent = '✗ Error processing image';
        console.error('OCR Error:', error);
        setTimeout(() => {
            statusText.textContent = '';
        }, 3000);
    }
}

// File upload handler
imageUpload.addEventListener('change', async function(e) {
    const file = e.target.files[0];
    if (!file) return;

    await processImageFile(file);

    // Reset file input
    e.target.value = '';
});

// Desktop: Paste event listener
document.addEventListener('paste', async function(e) {
    const items = e.clipboardData?.items;
    if (!items) return;

    for (let i = 0; i < items.length; i++) {
        if (items[i].type.startsWith('image/')) {
            e.preventDefault();
            const file = items[i].getAsFile();
            await processImageFile(file);
            break;
        }
    }
});

// Mobile: Show paste button if Clipboard API is supported
if (navigator.clipboard && navigator.clipboard.read) {
    pasteBtn.style.display = 'inline-block';

    pasteBtn.addEventListener('click', async function() {
        try {
            const clipboardItems = await navigator.clipboard.read();

            for (const item of clipboardItems) {
                for (const type of item.types) {
                    if (type.startsWith('image/')) {
                        const blob = await item.getType(type);
                        const file = new File([blob], 'clipboard-image.png', { type: blob.type });
                        await processImageFile(file);
                        return;
                    }
                }
            }

            statusText.textContent = '✗ No image in clipboard';
            setTimeout(() => statusText.textContent = '', 3000);

        } catch (error) {
            console.error('Clipboard error:', error);
            statusText.textContent = '✗ Could not access clipboard';
            setTimeout(() => statusText.textContent = '', 3000);
        }
    });
}

// Extract 4x4 grid cells from word bounding boxes
function extractGridCells(words) {
    // Calculate center point for each word
    const wordCenters = words.map(w => ({
        word: w,
        x: (w.bbox.x0 + w.bbox.x1) / 2,
        y: (w.bbox.y0 + w.bbox.y1) / 2
    }));

    // Find 4 row centers using clustering
    const yCenters = wordCenters.map(w => w.y);
    const rowClusters = clusterInto4(yCenters);

    // Find 4 column centers using clustering
    const xCenters = wordCenters.map(w => w.x);
    const colClusters = clusterInto4(xCenters);

    // Create a 4x4 grid of cells
    const grid = Array(4).fill(null).map(() => Array(4).fill(null).map(() => []));

    // Assign each word to the nearest grid cell
    wordCenters.forEach(({ word, x, y }) => {
        const rowIndex = findClosestCluster(y, rowClusters);
        const colIndex = findClosestCluster(x, colClusters);
        grid[rowIndex][colIndex].push(word.text.trim());
    });

    // Flatten grid to array of 16 cells, combining words in each cell
    const cells = [];
    for (let row = 0; row < 4; row++) {
        for (let col = 0; col < 4; col++) {
            const cellWords = grid[row][col].filter(t => t.length > 0);
            cells.push(cellWords.join(' '));
        }
    }

    return cells;
}

// Simple clustering algorithm to find 4 centers
function clusterInto4(values) {
    if (values.length === 0) return [0, 0, 0, 0];

    const sorted = [...values].sort((a, b) => a - b);
    const min = sorted[0];
    const max = sorted[sorted.length - 1];

    // Initialize 4 cluster centers evenly spaced
    let centers = [
        min + (max - min) * 0.125,
        min + (max - min) * 0.375,
        min + (max - min) * 0.625,
        min + (max - min) * 0.875
    ];

    // Run k-means iterations
    for (let iter = 0; iter < 10; iter++) {
        const clusters = [[], [], [], []];

        // Assign each value to nearest center
        values.forEach(val => {
            let nearestIdx = 0;
            let nearestDist = Math.abs(val - centers[0]);
            for (let i = 1; i < 4; i++) {
                const dist = Math.abs(val - centers[i]);
                if (dist < nearestDist) {
                    nearestDist = dist;
                    nearestIdx = i;
                }
            }
            clusters[nearestIdx].push(val);
        });

        // Update centers to mean of assigned values
        let changed = false;
        for (let i = 0; i < 4; i++) {
            if (clusters[i].length > 0) {
                const newCenter = clusters[i].reduce((a, b) => a + b, 0) / clusters[i].length;
                if (Math.abs(newCenter - centers[i]) > 0.1) {
                    changed = true;
                }
                centers[i] = newCenter;
            }
        }

        if (!changed) break;
    }

    return centers.sort((a, b) => a - b);
}

// Find which cluster a value is closest to
function findClosestCluster(value, centers) {
    let nearestIdx = 0;
    let nearestDist = Math.abs(value - centers[0]);
    for (let i = 1; i < centers.length; i++) {
        const dist = Math.abs(value - centers[i]);
        if (dist < nearestDist) {
            nearestDist = dist;
            nearestIdx = i;
        }
    }
    return nearestIdx;
}
