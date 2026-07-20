import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { blankMatrix, createBlock } from '@/domain';
import { music } from '@/audio/music';
import {
  clearLinesAtom,
  curAtom,
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
import { resetGameStore } from '@/test-utils/store';
import states from './controller';

describe('game controller', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.spyOn(Math, 'random').mockReturnValue(0);
    resetGameStore(null);
    music.start = vi.fn<() => void>();
    music.clear = vi.fn<() => void>();
    music.gameover = vi.fn<() => void>();
    music.move = vi.fn<() => void>();
    music.rotate = vi.fn<() => void>();
    music.fall = vi.fn<() => void>();
    if (states.fallInterval) {
      clearTimeout(states.fallInterval);
      states.fallInterval = null;
    }
  });

  afterEach(() => {
    if (states.fallInterval) {
      clearTimeout(states.fallInterval);
      states.fallInterval = null;
    }
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('start resets points, applies start matrix, spawns current and schedules auto', () => {
    gameStore.set(pointsAtom, 123);
    gameStore.set(speedStartAtom, 3);
    gameStore.set(startLinesAtom, 0);
    gameStore.set(nextAtom, 'T');
    const autoSpy = vi.spyOn(states, 'auto').mockImplementation(() => {});

    states.start();

    expect(music.start).toHaveBeenCalled();
    expect(gameStore.get(pointsAtom)).toBe(0);
    expect(gameStore.get(speedRunAtom)).toBe(3);
    expect(gameStore.get(curAtom)?.type).toBe('T');
    expect(gameStore.get(nextAtom)).toBe('I');
    expect(gameStore.get(matrixAtom)).toEqual(blankMatrix);
    expect(autoSpy).toHaveBeenCalled();
  });

  it('nextAround awards placement points and spawns next piece after delay', () => {
    resetGameStore({
      points: 0,
      speedRun: 2,
      next: 'O',
      cur: createBlock({ type: 'T', xy: [0, 4], timeStamp: 100 }),
    });
    const stopDown = vi.fn<() => void>();
    const autoSpy = vi.spyOn(states, 'auto').mockImplementation(() => {});

    states.nextAround(
      blankMatrix.map((row) => [...row]),
      stopDown,
    );

    expect(stopDown).toHaveBeenCalled();
    expect(gameStore.get(lockAtom)).toBe(true);
    expect(gameStore.get(pointsAtom)).toBe(12);

    vi.advanceTimersByTime(100);

    expect(gameStore.get(lockAtom)).toBe(false);
    expect(gameStore.get(curAtom)?.type).toBe('O');
    expect(gameStore.get(nextAtom)).toBe('I');
    expect(autoSpy).toHaveBeenCalled();
  });

  it('nextAround enters clear flow for full lines', () => {
    const matrix = blankMatrix.map((row) => [...row]);
    matrix[19] = Array(10).fill(1);
    const overSpy = vi.spyOn(states, 'overStart');

    states.nextAround(matrix);

    expect(gameStore.get(lockAtom)).toBe(true);
    expect(gameStore.get(pointsAtom)).toBe(10);
    expect(music.clear).toHaveBeenCalled();
    expect(overSpy).not.toHaveBeenCalled();
  });

  it('nextAround enters game over flow when top row is occupied', () => {
    const matrix = blankMatrix.map((row) => [...row]);
    matrix[0][0] = 1;
    const overSpy = vi.spyOn(states, 'overStart');

    states.nextAround(matrix);

    expect(music.gameover).toHaveBeenCalled();
    expect(overSpy).toHaveBeenCalled();
  });

  it('clearLines updates matrix, points, speed and unlocks game', () => {
    const matrix = blankMatrix.map((row) => [...row]);
    matrix[19] = Array(10).fill(1);
    gameStore.set(pointsAtom, 10);
    gameStore.set(nextAtom, 'L');
    gameStore.set(speedStartAtom, 1);
    gameStore.set(clearLinesAtom, 19);
    gameStore.set(lockAtom, true);
    const autoSpy = vi.spyOn(states, 'auto').mockImplementation(() => {});

    states.clearLines(matrix, [19]);

    expect(gameStore.get(lockAtom)).toBe(false);
    expect(gameStore.get(clearLinesAtom)).toBe(20);
    expect(gameStore.get(pointsAtom)).toBe(110);
    expect(gameStore.get(speedRunAtom)).toBe(2);
    expect(gameStore.get(curAtom)?.type).toBe('L');
    expect(gameStore.get(nextAtom)).toBe('I');
    expect(autoSpy).toHaveBeenCalled();
  });

  it('pause and focus stop or resume auto when appropriate', () => {
    resetGameStore({
      cur: createBlock({ type: 'I' }),
      pause: false,
      reset: false,
    });
    const autoSpy = vi.spyOn(states, 'auto').mockImplementation(() => {});

    states.pause(true);
    expect(gameStore.get(pauseAtom)).toBe(true);
    expect(autoSpy).not.toHaveBeenCalled();

    states.pause(false);
    expect(gameStore.get(pauseAtom)).toBe(false);
    expect(autoSpy).toHaveBeenCalledTimes(1);

    states.focus(false);
    expect(gameStore.get(lockAtom)).toBe(false);

    states.focus(true);
    expect(autoSpy).toHaveBeenCalledTimes(2);
  });

  it('overStart, overEnd and dispatchPoints manage reset/max state', () => {
    gameStore.set(pointsAtom, 10);
    gameStore.set(maxAtom, 15);

    states.overStart();
    expect(gameStore.get(lockAtom)).toBe(true);
    expect(gameStore.get(resetAtom)).toBe(true);
    expect(gameStore.get(pauseAtom)).toBe(false);

    states.dispatchPoints(20);
    expect(gameStore.get(pointsAtom)).toBe(20);
    expect(gameStore.get(maxAtom)).toBe(20);

    gameStore.set(clearLinesAtom, 5);
    gameStore.set(curAtom, createBlock({ type: 'S' }));
    states.overEnd();

    expect(gameStore.get(curAtom)).toBeNull();
    expect(gameStore.get(resetAtom)).toBe(false);
    expect(gameStore.get(lockAtom)).toBe(false);
    expect(gameStore.get(clearLinesAtom)).toBe(0);
  });
});
