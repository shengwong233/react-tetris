import type { BlockType, Matrix, Shape } from './types';

export const blockShape: Record<BlockType, Shape> = {
  I: [[1, 1, 1, 1]],
  L: [
    [0, 0, 1],
    [1, 1, 1],
  ],
  J: [
    [1, 0, 0],
    [1, 1, 1],
  ],
  Z: [
    [1, 1, 0],
    [0, 1, 1],
  ],
  S: [
    [0, 1, 1],
    [1, 1, 0],
  ],
  O: [
    [1, 1],
    [1, 1],
  ],
  T: [
    [0, 1, 0],
    [1, 1, 1],
  ],
};

export const origin: Record<BlockType, [number, number][]> = {
  I: [
    [-1, 1],
    [1, -1],
  ],
  L: [[0, 0]],
  J: [[0, 0]],
  Z: [[0, 0]],
  S: [[0, 0]],
  O: [[0, 0]],
  T: [
    [0, 0],
    [1, 0],
    [-1, 1],
    [0, -1],
  ],
};

export const blockType = Object.keys(blockShape) as BlockType[];

export const speeds = [800, 650, 500, 370, 250, 160] as const;

export const delays = [50, 60, 70, 80, 90, 100] as const;

export const fillLine = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1];

export const blankLine = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

export const blankMatrix: Matrix = Array.from({ length: 20 }, () => [...blankLine]);

export const clearPoints = [100, 300, 700, 1500] as const;

export const StorageKey = 'REACT_TETRIS';

export const maxPoint = 999999;

export const eachLines = 20;

export const BOARD_WIDTH = 10;

export const BOARD_HEIGHT = 20;
