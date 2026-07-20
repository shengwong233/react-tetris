import { blankLine, BOARD_HEIGHT } from './const';
import type { Matrix } from './types';

function getLine(min: number, max: number): number[] {
  const count = Math.floor((max - min + 1) * Math.random()) + min;
  const line: number[] = [];
  for (let i = 0; i < count; i++) {
    line.push(1);
  }
  for (let i = 0, len = 10 - count; i < len; i++) {
    const index = Math.floor((line.length + 1) * Math.random());
    line.splice(index, 0, 0);
  }
  return line;
}

export function getStartMatrix(startLines: number): Matrix {
  const startMatrix: Matrix = [];
  for (let i = 0; i < startLines; i++) {
    if (i <= 2) {
      startMatrix.push(getLine(5, 8));
    } else if (i <= 6) {
      startMatrix.push(getLine(4, 9));
    } else {
      startMatrix.push(getLine(3, 9));
    }
  }
  for (let i = 0, len = BOARD_HEIGHT - startLines; i < len; i++) {
    startMatrix.unshift([...blankLine]);
  }
  return startMatrix;
}
