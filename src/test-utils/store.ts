import type { GameState } from '@/domain';
import {
  clearLinesAtom,
  curAtom,
  dropAtom,
  focusAtom,
  keyboardAtom,
  lockAtom,
  matrixAtom,
  maxAtom,
  musicAtom,
  nextAtom,
  pauseAtom,
  pointsAtom,
  resetAtom,
  speedRunAtom,
  speedStartAtom,
  startLinesAtom,
} from '@/state/atoms';
import { createInitialState } from '@/state/persist';
import { gameStore } from '@/state/store';

export function resetGameStore(record: Partial<GameState> | null = null): GameState {
  const initial = createInitialState(record);

  gameStore.set(pauseAtom, initial.pause);
  gameStore.set(musicAtom, initial.music);
  gameStore.set(
    matrixAtom,
    initial.matrix.map((row) => [...row]),
  );
  gameStore.set(nextAtom, initial.next);
  gameStore.set(curAtom, initial.cur);
  gameStore.set(startLinesAtom, initial.startLines);
  gameStore.set(maxAtom, initial.max);
  gameStore.set(pointsAtom, initial.points);
  gameStore.set(speedStartAtom, initial.speedStart);
  gameStore.set(speedRunAtom, initial.speedRun);
  gameStore.set(lockAtom, initial.lock);
  gameStore.set(clearLinesAtom, initial.clearLines);
  gameStore.set(resetAtom, initial.reset);
  gameStore.set(dropAtom, initial.drop);
  gameStore.set(keyboardAtom, { ...initial.keyboard });
  gameStore.set(focusAtom, initial.focus);

  return initial;
}
