import { describe, expect, it } from 'vitest';
import { createBlock, fall, left, right, rotate } from './block';

describe('block factory and movement', () => {
  it('uses legacy spawn positions by type', () => {
    expect(createBlock({ type: 'I' }).xy).toEqual([0, 3]);
    expect(createBlock({ type: 'T' }).xy).toEqual([-1, 4]);
  });

  it('clones provided shape and xy instead of sharing references', () => {
    const shape = [[1, 1]];
    const xy: [number, number] = [3, 4];
    const block = createBlock({ type: 'I', shape, xy, timeStamp: 100 });

    shape[0][0] = 0;
    xy[0] = 9;

    expect(block.shape).toEqual([[1, 1]]);
    expect(block.xy).toEqual([3, 4]);
    expect(block.timeStamp).toBe(100);
  });

  it('moves left right and down while preserving shape contents', () => {
    const block = createBlock({ type: 'O', xy: [2, 5], timeStamp: 100 });

    expect(left(block).xy).toEqual([2, 4]);
    expect(right(block).xy).toEqual([2, 6]);

    const fallen = fall(block, 3);
    expect(fallen.xy).toEqual([5, 5]);
    expect(fallen.shape).toEqual(block.shape);
    expect(fallen.timeStamp).toBeGreaterThanOrEqual(100);
  });
});

describe('rotation parity', () => {
  it('returns T block to original shape and position after four rotations', () => {
    const block = createBlock({ type: 'T', xy: [4, 4], timeStamp: 100 });

    const once = rotate(block);
    const twice = rotate(once);
    const thrice = rotate(twice);
    const fourTimes = rotate(thrice);

    expect(fourTimes.shape).toEqual(block.shape);
    expect(fourTimes.xy).toEqual(block.xy);
    expect(fourTimes.rotateIndex).toBe(0);
    expect(fourTimes.timeStamp).toBe(100);
  });
});
