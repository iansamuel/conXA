import { describe, it, expect } from 'vitest';
import { clusterInto4, findClosestCluster } from '../script.js';

describe('clusterInto4', () => {
  it('should return 4 sorted cluster centers', () => {
    const values = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120];
    const centers = clusterInto4(values);

    expect(centers).toHaveLength(4);
    expect(centers[0]).toBeLessThan(centers[1]);
    expect(centers[1]).toBeLessThan(centers[2]);
    expect(centers[2]).toBeLessThan(centers[3]);
  });

  it('should handle evenly spaced values (perfect grid)', () => {
    // Simulate Y coordinates of 4 rows at y=10, 40, 70, 100
    const values = [
      10, 10, 10, 10,  // Row 1
      40, 40, 40, 40,  // Row 2
      70, 70, 70, 70,  // Row 3
      100, 100, 100, 100  // Row 4
    ];
    const centers = clusterInto4(values);

    expect(centers[0]).toBeCloseTo(10, 1);
    expect(centers[1]).toBeCloseTo(40, 1);
    expect(centers[2]).toBeCloseTo(70, 1);
    expect(centers[3]).toBeCloseTo(100, 1);
  });

  it('should handle slightly uneven spacing', () => {
    // Simulate slightly noisy measurements
    const values = [
      9, 11, 10, 12,      // Row 1: ~10
      38, 42, 40, 41,     // Row 2: ~40
      68, 72, 70, 71,     // Row 3: ~70
      98, 102, 100, 99    // Row 4: ~100
    ];
    const centers = clusterInto4(values);

    expect(centers[0]).toBeCloseTo(10.5, 1);
    expect(centers[1]).toBeCloseTo(40.25, 1);
    expect(centers[2]).toBeCloseTo(70.25, 1);
    expect(centers[3]).toBeCloseTo(99.75, 1);
  });

  it('should handle empty array', () => {
    const centers = clusterInto4([]);
    expect(centers).toEqual([0, 0, 0, 0]);
  });

  it('should handle fewer than 4 values', () => {
    const values = [10, 50, 90];
    const centers = clusterInto4(values);

    expect(centers).toHaveLength(4);
    // Should still return 4 centers, even if some may be empty
    expect(centers[0]).toBeGreaterThanOrEqual(0);
  });

  it('should handle all identical values', () => {
    const values = [50, 50, 50, 50, 50, 50, 50, 50];
    const centers = clusterInto4(values);

    expect(centers).toHaveLength(4);
    // All centers should converge to ~50
    expect(centers.every(c => Math.abs(c - 50) < 1)).toBe(true);
  });

  it('should cluster realistic OCR Y-coordinates', () => {
    // Realistic Y-coordinates from a 4x4 grid screenshot
    const yCoords = [
      50, 52, 51, 53,      // Row 1
      150, 152, 148, 151,  // Row 2
      250, 248, 252, 249,  // Row 3
      350, 353, 351, 352   // Row 4
    ];
    const centers = clusterInto4(yCoords);

    expect(centers[0]).toBeCloseTo(51.5, 1);
    expect(centers[1]).toBeCloseTo(150.25, 1);
    expect(centers[2]).toBeCloseTo(249.75, 1);
    expect(centers[3]).toBeCloseTo(351.5, 1);
  });
});

describe('findClosestCluster', () => {
  const centers = [10, 40, 70, 100];

  it('should assign value to closest cluster center', () => {
    expect(findClosestCluster(12, centers)).toBe(0);
    expect(findClosestCluster(38, centers)).toBe(1);
    expect(findClosestCluster(72, centers)).toBe(2);
    expect(findClosestCluster(98, centers)).toBe(3);
  });

  it('should handle values exactly at center', () => {
    expect(findClosestCluster(10, centers)).toBe(0);
    expect(findClosestCluster(40, centers)).toBe(1);
    expect(findClosestCluster(70, centers)).toBe(2);
    expect(findClosestCluster(100, centers)).toBe(3);
  });

  it('should handle boundary cases (halfway between centers)', () => {
    // 25 is exactly halfway between 10 and 40
    const result = findClosestCluster(25, centers);
    expect([0, 1]).toContain(result);  // Could be either, depending on implementation

    // 55 is exactly halfway between 40 and 70
    const result2 = findClosestCluster(55, centers);
    expect([1, 2]).toContain(result2);
  });

  it('should handle values outside the range', () => {
    expect(findClosestCluster(0, centers)).toBe(0);
    expect(findClosestCluster(200, centers)).toBe(3);
    expect(findClosestCluster(-50, centers)).toBe(0);
  });

  it('should work with single center', () => {
    expect(findClosestCluster(100, [50])).toBe(0);
    expect(findClosestCluster(0, [50])).toBe(0);
  });

  it('should assign to first cluster when all centers are equal', () => {
    const equalCenters = [50, 50, 50, 50];
    expect(findClosestCluster(100, equalCenters)).toBe(0);
    expect(findClosestCluster(0, equalCenters)).toBe(0);
  });
});
