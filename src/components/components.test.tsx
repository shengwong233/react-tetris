// @vitest-environment happy-dom

import { Provider } from 'jotai';
import { act, render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { gameStore } from '@/state/store';
import { musicAtom, nextAtom, pauseAtom } from '@/state/atoms';
import { resetGameStore } from '@/test-utils/store';
import { Music } from './music/Music';
import { Next } from './next/Next';
import { Number } from './number/Number';
import { Pause } from './pause/Pause';

describe('component smoke tests', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    resetGameStore(null);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('Number pads digits to the requested length', () => {
    const { container } = render(<Number number={42} length={4} />);
    const spans = Array.from(container.querySelectorAll('.number span'));

    expect(spans).toHaveLength(4);
    expect(spans[0].className).toContain('s_n');
    expect(spans[1].className).toContain('s_n');
    expect(spans[2].className).toContain('s_4');
    expect(spans[3].className).toContain('s_2');
  });

  it('Number renders clock digits in time mode', () => {
    vi.setSystemTime(new Date('2026-07-20T11:26:01'));

    const { container } = render(<Number time />);
    const spans = Array.from(container.querySelectorAll('.number span'));

    expect(spans).toHaveLength(5);
    expect(spans[0].className).toContain('s_1');
    expect(spans[1].className).toContain('s_1');
  });

  it('Next renders the active preview shape from store', () => {
    gameStore.set(nextAtom, 'O');

    const { container } = render(
      <Provider store={gameStore}>
        <Next />
      </Provider>,
    );

    expect(container.querySelectorAll('.next b.c')).toHaveLength(4);
  });

  it('Music and Pause reflect store state', () => {
    gameStore.set(musicAtom, false);
    gameStore.set(pauseAtom, true);

    const { container: musicContainer } = render(
      <Provider store={gameStore}>
        <Music />
      </Provider>,
    );
    expect(musicContainer.querySelector('.music')?.className).toContain('off');

    const { container: pauseContainer } = render(
      <Provider store={gameStore}>
        <Pause />
      </Provider>,
    );
    act(() => {
      vi.advanceTimersByTime(250);
    });
    expect(pauseContainer.querySelector('.pause')?.className).toContain('c');
  });
});
