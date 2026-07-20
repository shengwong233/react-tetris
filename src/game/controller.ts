import {
  blankLine,
  blankMatrix,
  clearLinePoints,
  createBlock,
  fall,
  getNextType,
  getStartMatrix,
  isClear,
  isOver,
  lockPiece,
  nextSpeedRun,
  placementPoints,
  speeds,
  want,
} from '@/domain';
import type { Matrix } from '@/domain';
import { music } from '@/audio/music';
import {
  clearLinesAtom,
  curAtom,
  focusAtom,
  lockAtom,
  matrixAtom,
  maxAtom,
  nextAtom,
  pauseAtom,
  pointsAtom,
  resetAtom,
  speedRunAtom,
  speedStartAtom,
  startLinesAtom,
} from '@/state/atoms';
import { gameStore } from '@/state/store';

type StopDown = () => void;

const states = {
  fallInterval: null as ReturnType<typeof setTimeout> | null,

  start: () => {
    music.start?.();
    const speedStart = gameStore.get(speedStartAtom);
    states.dispatchPoints(0);
    gameStore.set(speedRunAtom, speedStart);
    const startLines = gameStore.get(startLinesAtom);
    const startMatrix = getStartMatrix(startLines);
    gameStore.set(matrixAtom, startMatrix);
    const next = gameStore.get(nextAtom);
    gameStore.set(curAtom, createBlock({ type: next }));
    gameStore.set(nextAtom, getNextType());
    states.auto();
  },

  auto: (timeout?: number) => {
    const out = timeout !== undefined && timeout < 0 ? 0 : timeout;
    const fallOnce = () => {
      const cur = gameStore.get(curAtom);
      const matrix = gameStore.get(matrixAtom);
      if (!cur) return;
      const next = fall(cur);
      if (want(next, matrix)) {
        gameStore.set(curAtom, next);
        const speedRun = gameStore.get(speedRunAtom);
        states.fallInterval = setTimeout(fallOnce, speeds[speedRun - 1]);
      } else {
        const locked = lockPiece(matrix, cur);
        states.nextAround(locked);
      }
    };

    if (states.fallInterval) clearTimeout(states.fallInterval);
    const speedRun = gameStore.get(speedRunAtom);
    states.fallInterval = setTimeout(fallOnce, out === undefined ? speeds[speedRun - 1] : out);
  },

  nextAround: (matrix: Matrix, stopDownTrigger?: StopDown) => {
    if (states.fallInterval) clearTimeout(states.fallInterval);
    gameStore.set(lockAtom, true);
    gameStore.set(matrixAtom, matrix);
    stopDownTrigger?.();

    const points = gameStore.get(pointsAtom);
    const speedRun = gameStore.get(speedRunAtom);
    states.dispatchPoints(placementPoints(points, speedRun));

    if (isClear(matrix)) {
      music.clear?.();
      return;
    }
    if (isOver(matrix)) {
      music.gameover?.();
      states.overStart();
      return;
    }
    setTimeout(() => {
      gameStore.set(lockAtom, false);
      const next = gameStore.get(nextAtom);
      gameStore.set(curAtom, createBlock({ type: next }));
      gameStore.set(nextAtom, getNextType());
      states.auto();
    }, 100);
  },

  focus: (isFocus: boolean) => {
    gameStore.set(focusAtom, isFocus);
    if (!isFocus) {
      if (states.fallInterval) clearTimeout(states.fallInterval);
      return;
    }
    const cur = gameStore.get(curAtom);
    const reset = gameStore.get(resetAtom);
    const pause = gameStore.get(pauseAtom);
    if (cur && !reset && !pause) {
      states.auto();
    }
  },

  pause: (isPause: boolean) => {
    gameStore.set(pauseAtom, isPause);
    if (isPause) {
      if (states.fallInterval) clearTimeout(states.fallInterval);
      return;
    }
    states.auto();
  },

  clearLines: (matrix: Matrix, lines: number[]) => {
    const newMatrix = matrix.map((row) => [...row]);
    lines.forEach((n) => {
      newMatrix.splice(n, 1);
      newMatrix.unshift([...blankLine]);
    });
    gameStore.set(matrixAtom, newMatrix);
    const next = gameStore.get(nextAtom);
    gameStore.set(curAtom, createBlock({ type: next }));
    gameStore.set(nextAtom, getNextType());
    states.auto();
    gameStore.set(lockAtom, false);

    const clearLines = gameStore.get(clearLinesAtom) + lines.length;
    gameStore.set(clearLinesAtom, clearLines);

    const points = gameStore.get(pointsAtom);
    states.dispatchPoints(clearLinePoints(points, lines.length));

    const speedStart = gameStore.get(speedStartAtom);
    gameStore.set(speedRunAtom, nextSpeedRun(speedStart, clearLines));
  },

  overStart: () => {
    if (states.fallInterval) clearTimeout(states.fallInterval);
    gameStore.set(lockAtom, true);
    gameStore.set(resetAtom, true);
    gameStore.set(pauseAtom, false);
  },

  overEnd: () => {
    gameStore.set(
      matrixAtom,
      blankMatrix.map((r) => [...r]),
    );
    gameStore.set(curAtom, null);
    gameStore.set(resetAtom, false);
    gameStore.set(lockAtom, false);
    gameStore.set(clearLinesAtom, 0);
  },

  dispatchPoints: (point: number) => {
    gameStore.set(pointsAtom, point);
    const max = gameStore.get(maxAtom);
    if (point > 0 && point > max) {
      gameStore.set(maxAtom, point);
    }
  },
};

export default states;
