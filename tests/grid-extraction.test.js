import { describe, it, expect } from 'vitest';
import { extractGridCells } from '../script.js';

describe('extractGridCells', () => {
  // Helper to create mock OCR word with bounding box
  function createWord(text, x0, y0, x1, y1) {
    return {
      text,
      bbox: { x0, y0, x1, y1 }
    };
  }

  it('should extract 16 cells from a perfect 4x4 grid', () => {
    // Create a perfect 4x4 grid with words at regular intervals
    // Grid positions: rows at y=50,150,250,350; cols at x=50,150,250,350
    const words = [
      // Row 1
      createWord('A', 40, 40, 60, 60),
      createWord('B', 140, 40, 160, 60),
      createWord('C', 240, 40, 260, 60),
      createWord('D', 340, 40, 360, 60),
      // Row 2
      createWord('E', 40, 140, 60, 160),
      createWord('F', 140, 140, 160, 160),
      createWord('G', 240, 140, 260, 160),
      createWord('H', 340, 140, 360, 160),
      // Row 3
      createWord('I', 40, 240, 60, 260),
      createWord('J', 140, 240, 160, 260),
      createWord('K', 240, 240, 260, 260),
      createWord('L', 340, 240, 360, 260),
      // Row 4
      createWord('M', 40, 340, 60, 360),
      createWord('N', 140, 340, 160, 360),
      createWord('O', 240, 340, 260, 360),
      createWord('P', 340, 340, 360, 360)
    ];

    const cells = extractGridCells(words);

    expect(cells).toHaveLength(16);
    expect(cells).toEqual([
      'A', 'B', 'C', 'D',
      'E', 'F', 'G', 'H',
      'I', 'J', 'K', 'L',
      'M', 'N', 'O', 'P'
    ]);
  });

  it('should handle multi-word cells', () => {
    // Grid with some cells containing multiple words
    const words = [
      // Row 1 - cell 1 has two words
      createWord('NEW', 40, 40, 55, 60),
      createWord('YORK', 56, 40, 70, 60),
      createWord('PARIS', 140, 40, 160, 60),
      createWord('TOKYO', 240, 40, 260, 60),
      createWord('ROME', 340, 40, 360, 60),
      // Row 2
      createWord('CAT', 40, 140, 60, 160),
      createWord('DOG', 140, 140, 160, 160),
      createWord('FISH', 240, 140, 260, 160),
      createWord('BIRD', 340, 140, 360, 160),
      // Row 3
      createWord('RED', 40, 240, 60, 260),
      createWord('BLUE', 140, 240, 160, 260),
      createWord('GREEN', 240, 240, 260, 260),
      createWord('YELLOW', 340, 240, 360, 260),
      // Row 4
      createWord('APPLE', 40, 340, 60, 360),
      createWord('ORANGE', 140, 340, 160, 360),
      createWord('BANANA', 240, 340, 260, 360),
      createWord('GRAPE', 340, 340, 360, 360)
    ];

    const cells = extractGridCells(words);

    expect(cells).toHaveLength(16);
    expect(cells[0]).toBe('NEW YORK');  // Multi-word cell
    expect(cells[1]).toBe('PARIS');
    expect(cells[2]).toBe('TOKYO');
  });

  it('should handle empty cells', () => {
    // Grid with some missing words (empty cells)
    const words = [
      // Row 1 - missing cell at position (2,0)
      createWord('A', 40, 40, 60, 60),
      createWord('B', 140, 40, 160, 60),
      // Skip C
      createWord('D', 340, 40, 360, 60),
      // Row 2
      createWord('E', 40, 140, 60, 160),
      createWord('F', 140, 140, 160, 160),
      createWord('G', 240, 140, 260, 160),
      createWord('H', 340, 140, 360, 160),
      // Row 3
      createWord('I', 40, 240, 60, 260),
      createWord('J', 140, 240, 160, 260),
      createWord('K', 240, 240, 260, 260),
      createWord('L', 340, 240, 360, 260),
      // Row 4
      createWord('M', 40, 340, 60, 360),
      createWord('N', 140, 340, 160, 360),
      createWord('O', 240, 340, 260, 360),
      createWord('P', 340, 340, 360, 360)
    ];

    const cells = extractGridCells(words);

    expect(cells).toHaveLength(16);
    expect(cells[0]).toBe('A');
    expect(cells[1]).toBe('B');
    expect(cells[2]).toBe('');  // Empty cell
    expect(cells[3]).toBe('D');
  });

  it('should handle slightly uneven spacing (realistic OCR)', () => {
    // More realistic with slight variations in position
    const words = [
      // Row 1 (y ≈ 50)
      createWord('APPLE', 38, 48, 62, 68),
      createWord('ORANGE', 142, 52, 158, 72),
      createWord('BANANA', 238, 49, 262, 69),
      createWord('GRAPE', 341, 51, 359, 71),
      // Row 2 (y ≈ 150)
      createWord('CAT', 41, 148, 59, 168),
      createWord('DOG', 139, 151, 161, 171),
      createWord('FISH', 242, 149, 258, 169),
      createWord('BIRD', 338, 152, 362, 172),
      // Row 3 (y ≈ 250)
      createWord('RED', 39, 249, 61, 269),
      createWord('BLUE', 141, 248, 159, 268),
      createWord('GREEN', 239, 251, 261, 271),
      createWord('YELLOW', 342, 250, 358, 270),
      // Row 4 (y ≈ 350)
      createWord('NORTH', 40, 351, 60, 371),
      createWord('SOUTH', 140, 349, 160, 369),
      createWord('EAST', 241, 350, 259, 370),
      createWord('WEST', 339, 352, 361, 372)
    ];

    const cells = extractGridCells(words);

    expect(cells).toHaveLength(16);
    // Verify row 1
    expect(cells[0]).toBe('APPLE');
    expect(cells[1]).toBe('ORANGE');
    expect(cells[2]).toBe('BANANA');
    expect(cells[3]).toBe('GRAPE');
    // Verify row 4
    expect(cells[12]).toBe('NORTH');
    expect(cells[13]).toBe('SOUTH');
    expect(cells[14]).toBe('EAST');
    expect(cells[15]).toBe('WEST');
  });

  it('should handle words with irregular sizes', () => {
    // Some words are much longer/shorter than others
    const words = [
      // Row 1
      createWord('I', 40, 40, 50, 60),
      createWord('EXTRAORDINARY', 120, 40, 180, 60),
      createWord('AM', 240, 40, 260, 60),
      createWord('WORD', 340, 40, 360, 60),
      // Row 2-4 (fill with regular words)
      createWord('E', 40, 140, 60, 160),
      createWord('F', 140, 140, 160, 160),
      createWord('G', 240, 140, 260, 160),
      createWord('H', 340, 140, 360, 160),
      createWord('I', 40, 240, 60, 260),
      createWord('J', 140, 240, 160, 260),
      createWord('K', 240, 240, 260, 260),
      createWord('L', 340, 240, 360, 260),
      createWord('M', 40, 340, 60, 360),
      createWord('N', 140, 340, 160, 360),
      createWord('O', 240, 340, 260, 360),
      createWord('P', 340, 340, 360, 360)
    ];

    const cells = extractGridCells(words);

    expect(cells).toHaveLength(16);
    expect(cells[0]).toBe('I');
    expect(cells[1]).toBe('EXTRAORDINARY');
    expect(cells[2]).toBe('AM');
  });

  it('should handle compound words in same cell (close proximity)', () => {
    // Two words very close together should go in same cell
    const words = [
      // Row 1, col 1 - "NEW YORK" close together
      createWord('NEW', 40, 45, 50, 55),
      createWord('YORK', 51, 45, 61, 55),
      // Rest of row 1
      createWord('PARIS', 140, 45, 160, 55),
      createWord('LONDON', 240, 45, 260, 55),
      createWord('TOKYO', 340, 45, 360, 55),
      // Rows 2-4
      createWord('E', 40, 140, 60, 160),
      createWord('F', 140, 140, 160, 160),
      createWord('G', 240, 140, 260, 160),
      createWord('H', 340, 140, 360, 160),
      createWord('I', 40, 240, 60, 260),
      createWord('J', 140, 240, 160, 260),
      createWord('K', 240, 240, 260, 260),
      createWord('L', 340, 240, 360, 260),
      createWord('M', 40, 340, 60, 360),
      createWord('N', 140, 340, 160, 360),
      createWord('O', 240, 340, 260, 360),
      createWord('P', 340, 340, 360, 360)
    ];

    const cells = extractGridCells(words);

    expect(cells).toHaveLength(16);
    expect(cells[0]).toBe('NEW YORK');
  });

  it('should trim whitespace from cell content', () => {
    const words = [
      createWord(' TRIMMED ', 40, 40, 60, 60),
      createWord('B', 140, 40, 160, 60),
      createWord('C', 240, 40, 260, 60),
      createWord('D', 340, 40, 360, 60),
      createWord('E', 40, 140, 60, 160),
      createWord('F', 140, 140, 160, 160),
      createWord('G', 240, 140, 260, 160),
      createWord('H', 340, 140, 360, 160),
      createWord('I', 40, 240, 60, 260),
      createWord('J', 140, 240, 160, 260),
      createWord('K', 240, 240, 260, 260),
      createWord('L', 340, 240, 360, 260),
      createWord('M', 40, 340, 60, 360),
      createWord('N', 140, 340, 160, 360),
      createWord('O', 240, 340, 260, 360),
      createWord('P', 340, 340, 360, 360)
    ];

    const cells = extractGridCells(words);

    expect(cells[0]).toBe('TRIMMED');  // Whitespace should be trimmed
  });
});
