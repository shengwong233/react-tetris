export type BlockType = 'I' | 'L' | 'J' | 'Z' | 'S' | 'O' | 'T';

export type Cell = 0 | 1 | 2;

export type Matrix = number[][];

export type Shape = number[][];

export interface BlockData {
  type: BlockType;
  shape: Shape;
  xy: [number, number];
  rotateIndex: number;
  timeStamp: number;
}

export interface KeyboardState {
  drop: boolean;
  down: boolean;
  left: boolean;
  right: boolean;
  rotate: boolean;
  reset: boolean;
  music: boolean;
  pause: boolean;
}

export interface GameState {
  pause: boolean;
  music: boolean;
  matrix: Matrix;
  next: BlockType;
  cur: BlockData | null;
  startLines: number;
  max: number;
  points: number;
  speedStart: number;
  speedRun: number;
  lock: boolean;
  clearLines: number;
  reset: boolean;
  drop: boolean;
  keyboard: KeyboardState;
  focus: boolean;
}
