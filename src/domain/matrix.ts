import { blankLine, BOARD_HEIGHT, BOARD_WIDTH, blockType } from './const';
import type { BlockData, BlockType, Matrix } from './types';

export function getNextType(): BlockType {
  return blockType[Math.floor(Math.random() * blockType.length)];
}

export function want(next: BlockData, matrix: Matrix): boolean {
  const xy = next.xy;
  const shape = next.shape;
  const horizontal = shape[0].length;
  return shape.every((m, k1) =>
    m.every((n, k2) => {
      if (xy[1] < 0) return false;
      if (xy[1] + horizontal > BOARD_WIDTH) return false;
      if (xy[0] + k1 < 0) return true;
      if (xy[0] + k1 >= BOARD_HEIGHT) return false;
      if (n) {
        return !matrix[xy[0] + k1][xy[1] + k2];
      }
      return true;
    }),
  );
}

export function isClear(matrix: Matrix): number[] | false {
  const clearLines: number[] = [];
  matrix.forEach((m, k) => {
    if (m.every((n) => !!n)) {
      clearLines.push(k);
    }
  });
  return clearLines.length === 0 ? false : clearLines;
}

export function isOver(matrix: Matrix): boolean {
  return matrix[0].some((n) => !!n);
}

export function lockPiece(matrix: Matrix, cur: BlockData): Matrix {
  let next = matrix.map((row) => [...row]);
  const { shape, xy } = cur;
  shape.forEach((m, k1) => {
    m.forEach((n, k2) => {
      if (n && xy[0] + k1 >= 0) {
        next[xy[0] + k1][xy[1] + k2] = 1;
      }
    });
  });
  return next;
}

export function clearLinesOnMatrix(matrix: Matrix, lines: number[]): Matrix {
  let next = matrix.map((row) => [...row]);
  lines.forEach((n) => {
    next.splice(n, 1);
    next.unshift([...blankLine]);
  });
  return next;
}

export function cloneMatrix(matrix: Matrix): Matrix {
  return matrix.map((row) => [...row]);
}
