import { describe, expect, it } from 'vitest';
import { createBlock, rotate } from './block';
import { blankMatrix, clearPoints } from './const';
import { clearLinesOnMatrix, isClear, isOver, lockPiece, want } from './matrix';
import { clearLinePoints, nextSpeedRun, placementPoints } from './score';
import { getStartMatrix } from './startMatrix';

describe('want / lock / clear', () => {
  it('allows top overhang and rejects wall collision', () => {
    const block = createBlock({ type: 'T', xy: [-1, 4] });
    expect(want(block, blankMatrix)).toBe(true);
    expect(want(createBlock({ type: 'O', xy: [0, -1] }), blankMatrix)).toBe(false);
    expect(want(createBlock({ type: 'O', xy: [0, 9] }), blankMatrix)).toBe(false);
  });

  it('locks piece and detects clear lines', () => {
    let matrix = blankMatrix.map((row) => [...row]);
    matrix[19] = [1, 1, 1, 1, 1, 1, 1, 1, 1, 0];
    const cur = createBlock({ type: 'O', xy: [18, 8] });
    matrix = lockPiece(matrix, cur);
    const lines = isClear(matrix);
    expect(lines).toEqual([19]);
    const cleared = clearLinesOnMatrix(matrix, lines as number[]);
    expect(cleared.length).toBe(20);
    expect(cleared[0].every((n) => n === 0)).toBe(true);
    expect(isClear(cleared)).toBe(false);
  });

  it('detects game over on top row', () => {
    const matrix = blankMatrix.map((row) => [...row]);
    matrix[0][0] = 1;
    expect(isOver(matrix)).toBe(true);
  });
});

describe('rotate', () => {
  it('rotates I with origin offset', () => {
    const block = createBlock({ type: 'I' });
    const next = rotate(block);
    expect(next.rotateIndex).toBe(1);
    expect(next.xy).toEqual([-1, 4]);
    expect(next.shape.length).toBe(4);
  });
});

describe('score / speed', () => {
  it('computes placement and clear points', () => {
    expect(placementPoints(0, 1)).toBe(10);
    expect(placementPoints(0, 6)).toBe(20);
    expect(clearLinePoints(0, 1)).toBe(clearPoints[0]);
    expect(clearLinePoints(0, 4)).toBe(clearPoints[3]);
  });

  it('increases speed every 20 lines', () => {
    expect(nextSpeedRun(1, 19)).toBe(1);
    expect(nextSpeedRun(1, 20)).toBe(2);
    expect(nextSpeedRun(5, 40)).toBe(6);
  });
});

describe('start matrix', () => {
  it('pads to 20 rows', () => {
    expect(getStartMatrix(0).length).toBe(20);
    expect(getStartMatrix(0).every((row) => row.every((c) => c === 0))).toBe(true);
    const m = getStartMatrix(5);
    expect(m.length).toBe(20);
    expect(m.slice(0, 15).every((row) => row.every((c) => c === 0))).toBe(true);
  });
});
