/**
 * OCR Processing Module with k-means clustering
 */

class OCRProcessor {
    constructor(gridApp) {
        this.gridApp = gridApp;
        this.worker = null;
        this.imageCache = new Map();
        this.cacheTimeout = 15 * 60 * 1000; // 15 minutes
        this.maxFileSize = 10 * 1024 * 1024; // 10MB
        this.allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
    }

    async init() {
        // Lazy load Tesseract worker
        if (!this.worker && typeof Tesseract !== 'undefined') {
            try {
                this.worker = await Tesseract.createWorker('eng');
                console.log('OCR worker initialized');
            } catch (error) {
                console.error('Failed to initialize OCR worker:', error);
            }
        }
    }

    async handleImageUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        // Validate file
        const validation = this.validateFile(file);
        if (!validation.valid) {
            this.gridApp.showToast(validation.error, 'error');
            event.target.value = '';
            return;
        }

        const statusText = document.getElementById('status');
        const spinner = document.getElementById('spinner');

        if (statusText) statusText.textContent = 'Processing image...';
        if (spinner) spinner.classList.add('active');

        try {
            // Show image preview
            this.showImagePreview(file);

            // Check cache
            const cacheKey = await this.getFileHash(file);
            if (this.imageCache.has(cacheKey)) {
                const cachedResult = this.imageCache.get(cacheKey);
                this.populateGrid(cachedResult);
                if (statusText) statusText.textContent = `✓ Loaded ${cachedResult.length} cells (cached)`;
                if (spinner) spinner.classList.remove('active');
                this.hideImagePreview();
                event.target.value = '';
                return;
            }

            // Initialize worker if needed
            await this.init();

            if (!this.worker) {
                throw new Error('OCR worker not available');
            }

            // Process image
            const { data } = await this.worker.recognize(file, {
                logger: (m) => {
                    if (m.status === 'recognizing text' && statusText) {
                        statusText.textContent = `Processing: ${Math.round(m.progress * 100)}%`;
                    }
                }
            });

            // Extract words with bounding boxes
            const words = data.words.filter(w => w.text.trim().length > 0);

            if (words.length === 0) {
                throw new Error('No text detected in image');
            }

            // Validate that we have a reasonable grid structure
            const validation = this.validateGridStructure(words);
            if (!validation.valid) {
                throw new Error(validation.error);
            }

            // Extract grid cells
            const cells = this.extractGridCells(words);

            // Cache result
            this.imageCache.set(cacheKey, cells);
            setTimeout(() => this.imageCache.delete(cacheKey), this.cacheTimeout);

            // Populate grid
            this.populateGrid(cells);

            if (statusText) {
                statusText.textContent = `✓ Loaded ${cells.length} cells`;
                setTimeout(() => {
                    if (statusText) statusText.textContent = '';
                }, 3000);
            }

            this.gridApp.showToast('Image processed successfully', 'success');

        } catch (error) {
            console.error('OCR Error:', error);
            const errorMessage = error.message || 'Error processing image';

            if (statusText) {
                statusText.textContent = `✗ ${errorMessage}`;
                setTimeout(() => {
                    if (statusText) statusText.textContent = '';
                }, 5000);
            }

            this.gridApp.showToast(errorMessage, 'error');

        } finally {
            if (spinner) spinner.classList.remove('active');
            this.hideImagePreview();
            event.target.value = ''; // Reset file input
        }
    }

    validateFile(file) {
        if (!this.allowedTypes.includes(file.type)) {
            return {
                valid: false,
                error: 'Please upload a valid image file (JPEG, PNG, WebP)'
            };
        }

        if (file.size > this.maxFileSize) {
            return {
                valid: false,
                error: 'File size too large. Maximum 10MB allowed'
            };
        }

        return { valid: true };
    }

    async getFileHash(file) {
        // Simple hash based on file name, size, and last modified
        return `${file.name}_${file.size}_${file.lastModified}`;
    }

    validateGridStructure(words) {
        // Check if we have enough words for a 4x4 grid
        if (words.length < 4) {
            return {
                valid: false,
                error: 'Not enough text detected. Expected at least 4 words for a grid.'
            };
        }

        // Check if words are reasonably distributed
        const xCoords = words.map(w => (w.bbox.x0 + w.bbox.x1) / 2);
        const yCoords = words.map(w => (w.bbox.y0 + w.bbox.y1) / 2);

        const xRange = Math.max(...xCoords) - Math.min(...xCoords);
        const yRange = Math.max(...yCoords) - Math.min(...yCoords);

        // Expect a roughly square layout
        const aspectRatio = xRange / yRange;
        if (aspectRatio < 0.5 || aspectRatio > 2) {
            return {
                valid: false,
                error: 'Image doesn\'t appear to contain a grid layout. Try a different image.'
            };
        }

        return { valid: true };
    }

    showImagePreview(file) {
        const preview = document.getElementById('imagePreview');
        if (!preview) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            preview.src = e.target.result;
            preview.classList.add('active');
        };
        reader.readAsDataURL(file);
    }

    hideImagePreview() {
        const preview = document.getElementById('imagePreview');
        if (preview) {
            setTimeout(() => {
                preview.classList.remove('active');
                preview.src = '';
            }, 1000);
        }
    }

    populateGrid(cells) {
        const squares = document.querySelectorAll('.square');
        squares.forEach((square, index) => {
            if (index < cells.length) {
                square.textContent = cells[index];
            } else {
                square.textContent = '';
            }
        });

        this.gridApp.saveState();
        this.gridApp.saveToStorage();
    }

    extractGridCells(words) {
        // Calculate center point for each word
        const wordCenters = words.map(w => ({
            word: w,
            x: (w.bbox.x0 + w.bbox.x1) / 2,
            y: (w.bbox.y0 + w.bbox.y1) / 2,
            width: w.bbox.x1 - w.bbox.x0,
            height: w.bbox.y1 - w.bbox.y0
        }));

        // Find row and column clusters
        const yCenters = wordCenters.map(w => w.y);
        const xCenters = wordCenters.map(w => w.x);

        const rowClusters = this.clusterInto4(yCenters);
        const colClusters = this.clusterInto4(xCenters);

        // Create a 4x4 grid of cells
        const grid = Array(4).fill(null).map(() =>
            Array(4).fill(null).map(() => [])
        );

        // Assign each word to the nearest grid cell
        wordCenters.forEach(({ word, x, y }) => {
            const rowIndex = this.findClosestCluster(y, rowClusters);
            const colIndex = this.findClosestCluster(x, colClusters);

            if (rowIndex >= 0 && rowIndex < 4 && colIndex >= 0 && colIndex < 4) {
                grid[rowIndex][colIndex].push({
                    text: word.text.trim(),
                    x: x
                });
            }
        });

        // Flatten grid to array of 16 cells
        const cells = [];
        for (let row = 0; row < 4; row++) {
            for (let col = 0; col < 4; col++) {
                // Sort words within each cell by x position (left to right)
                const cellWords = grid[row][col]
                    .sort((a, b) => a.x - b.x)
                    .map(item => item.text)
                    .filter(text => text.length > 0);

                cells.push(cellWords.join(' '));
            }
        }

        return cells;
    }

    clusterInto4(values) {
        if (values.length === 0) return [0, 0, 0, 0];
        if (values.length < 4) {
            // Handle edge case with fewer than 4 values
            const sorted = [...values].sort((a, b) => a - b);
            while (sorted.length < 4) {
                sorted.push(sorted[sorted.length - 1]);
            }
            return sorted;
        }

        const sorted = [...values].sort((a, b) => a - b);
        const min = sorted[0];
        const max = sorted[sorted.length - 1];

        // Prevent division by zero
        if (max === min) {
            return [min, min, min, min];
        }

        // Initialize 4 cluster centers evenly spaced
        let centers = [
            min + (max - min) * 0.125,
            min + (max - min) * 0.375,
            min + (max - min) * 0.625,
            min + (max - min) * 0.875
        ];

        // Run k-means iterations
        const maxIterations = 20;
        for (let iter = 0; iter < maxIterations; iter++) {
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

            // Update centers to median of assigned values (more robust than mean)
            let changed = false;
            for (let i = 0; i < 4; i++) {
                if (clusters[i].length > 0) {
                    const sorted = clusters[i].sort((a, b) => a - b);
                    const newCenter = sorted[Math.floor(sorted.length / 2)];

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

    findClosestCluster(value, centers) {
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

    async cleanup() {
        // Cleanup worker when not needed
        if (this.worker) {
            await this.worker.terminate();
            this.worker = null;
        }
        this.imageCache.clear();
    }
}

// Initialize OCR processor when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    if (window.gridApp) {
        window.ocrProcessor = new OCRProcessor(window.gridApp);
    }
});
