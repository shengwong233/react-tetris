import { atom } from 'jotai';
import type { BlockData, BlockType, KeyboardState, Matrix } from '@/domain';
import { createInitialState, defaultKeyboard } from './persist';

const initial = createInitialState();

export const pauseAtom = atom(initial.pause);
export const musicAtom = atom(initial.music);
export const matrixAtom = atom<Matrix>(initial.matrix);
export const nextAtom = atom<BlockType>(initial.next);
export const curAtom = atom<BlockData | null>(initial.cur);
export const startLinesAtom = atom(initial.startLines);
export const maxAtom = atom(initial.max);
export const pointsAtom = atom(initial.points);
export const speedStartAtom = atom(initial.speedStart);
export const speedRunAtom = atom(initial.speedRun);
export const lockAtom = atom(initial.lock);
export const clearLinesAtom = atom(initial.clearLines);
export const resetAtom = atom(initial.reset);
export const dropAtom = atom(initial.drop);
export const keyboardAtom = atom<KeyboardState>({ ...defaultKeyboard });
export const focusAtom = atom(initial.focus);

export const gameSnapshotAtom = atom((get) => ({
  pause: get(pauseAtom),
  music: get(musicAtom),
  matrix: get(matrixAtom),
  next: get(nextAtom),
  cur: get(curAtom),
  startLines: get(startLinesAtom),
  max: get(maxAtom),
  points: get(pointsAtom),
  speedStart: get(speedStartAtom),
  speedRun: get(speedRunAtom),
  lock: get(lockAtom),
  clearLines: get(clearLinesAtom),
  reset: get(resetAtom),
  drop: get(dropAtom),
  keyboard: get(keyboardAtom),
  focus: get(focusAtom),
}));
