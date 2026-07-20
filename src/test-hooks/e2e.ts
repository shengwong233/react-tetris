import type { BlockType, GameState, Matrix } from '@/domain';
import states from '@/game/controller';
import { todo, type TodoKey } from '@/input/actions';
import { gameSnapshotAtom } from '@/state/atoms';
import { gameStore } from '@/state/store';
import { resetGameStore } from '@/test-utils/store';

declare global {
  interface Window {
    tetrisE2E?: {
      tap: (key: TodoKey) => void;
      keyDown: (key: TodoKey) => void;
      keyUp: (key: TodoKey) => void;
      reset: (record?: Partial<GameState> | null) => void;
      start: () => void;
      focus: (isFocus: boolean) => void;
      pause: (isPause: boolean) => void;
      clearLines: (matrix: Matrix, lines: number[]) => void;
      nextAround: (matrix: Matrix) => void;
      overStart: () => void;
      overEnd: () => void;
      snapshot: () => {
        pause: boolean;
        music: boolean;
        startLines: number;
        speedStart: number;
        speedRun: number;
        clearLines: number;
        hasCur: boolean;
        curType: BlockType | null;
        curXy: [number, number] | null;
        lockedCells: number;
        drop: boolean;
        reset: boolean;
        focus: boolean;
        points: number;
        max: number;
        next: BlockType;
      };
    };
  }
}

function stopAuto() {
  if (states.fallInterval) {
    clearTimeout(states.fallInterval);
    states.fallInterval = null;
  }
}

export function installE2EHooks() {
  if (typeof window === 'undefined') return;

  window.tetrisE2E = {
    tap(key) {
      todo[key].down();
      todo[key].up();
    },
    keyDown(key) {
      todo[key].down();
    },
    keyUp(key) {
      todo[key].up();
    },
    reset(record = null) {
      stopAuto();
      resetGameStore(record);
    },
    start() {
      stopAuto();
      states.start();
    },
    focus(isFocus) {
      states.focus(isFocus);
    },
    pause(isPause) {
      states.pause(isPause);
    },
    clearLines(matrix, lines) {
      stopAuto();
      states.clearLines(matrix, lines);
    },
    nextAround(matrix) {
      stopAuto();
      states.nextAround(matrix);
    },
    overStart() {
      stopAuto();
      states.overStart();
    },
    overEnd() {
      stopAuto();
      states.overEnd();
    },
    snapshot() {
      const state = gameStore.get(gameSnapshotAtom);
      return {
        pause: state.pause,
        music: state.music,
        startLines: state.startLines,
        speedStart: state.speedStart,
        speedRun: state.speedRun,
        clearLines: state.clearLines,
        hasCur: state.cur !== null,
        curType: state.cur?.type ?? null,
        curXy: state.cur ? [...state.cur.xy] : null,
        lockedCells: state.matrix.flat().filter((cell) => cell !== 0).length,
        drop: state.drop,
        reset: state.reset,
        focus: state.focus,
        points: state.points,
        max: state.max,
        next: state.next,
      };
    },
  };
}
