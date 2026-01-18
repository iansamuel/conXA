# Testing Guide

This project uses [Vitest](https://vitest.dev/) for testing.

## Running Tests

```bash
# Run all tests once
npm test

# Run tests in watch mode (re-runs on file changes)
npm run test:watch

# Run tests with UI
npm run test:ui

# Run tests with coverage report
npm run test:coverage
```

## Test Structure

### Unit Tests

**`clustering.test.js`** - Tests for k-means clustering algorithm
- Tests `clusterInto4()` with various input patterns
- Tests `findClosestCluster()` for cluster assignment
- Covers edge cases: empty arrays, identical values, uneven spacing

**`grid-extraction.test.js`** - Tests for grid cell extraction
- Tests `extractGridCells()` with mock OCR data
- Covers: perfect grids, multi-word cells, empty cells, uneven spacing
- Uses synthetic bounding box data (no actual OCR)

### Integration Tests

**`ocr-integration.test.js`** - OCR integration tests (skipped by default)
- Designed to test with real Tesseract.js OCR on actual images
- Currently skipped because:
  - Requires test images in `test-images/` directory
  - Each test takes 10-30 seconds (OCR is slow)
  - Requires `tesseract.js` installation

To enable integration tests:
1. Add test images to `test-images/` directory
2. Create corresponding `.expected.json` files
3. Remove `.skip` from the test
4. Run with: `npm test`

## Test Coverage

Run coverage report:
```bash
npm run test:coverage
```

Coverage reports are generated in `coverage/` directory.

## Writing New Tests

### Unit Test Example

```javascript
import { describe, it, expect } from 'vitest';
import { yourFunction } from '../script.js';

describe('yourFunction', () => {
  it('should do something specific', () => {
    const result = yourFunction(input);
    expect(result).toBe(expectedOutput);
  });
});
```

### Adding Test Images

See `test-images/README.md` for instructions on adding OCR integration tests.

## CI/CD

Tests run automatically on:
- Every commit (via git hooks, if configured)
- Pull requests (if CI is set up)
- Pre-deployment (recommended)

## Known Limitations

1. **Browser-only code**: Some DOM manipulation can't be fully tested in Node.js environment
2. **OCR variability**: Tesseract.js results may vary slightly between runs
3. **Async timing**: OCR tests are slow due to image processing

## Troubleshooting

**Tests fail with "Cannot read properties of null"**
- The DOM environment isn't initialized properly
- Check that test environment is set to 'happy-dom' in `vitest.config.js`

**Import errors**
- Ensure script.js exports are wrapped in CommonJS check
- Verify package.json has `"type": "module"`

**OCR tests timeout**
- Increase timeout in vitest config: `testTimeout: 60000`
- OCR processing can take 30+ seconds per image
