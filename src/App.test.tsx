// @vitest-environment happy-dom

import { Provider } from 'jotai';
import { render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createBlock, speeds } from '@/domain';
import { gameStore } from '@/state/store';
import { resetGameStore } from '@/test-utils/store';

const { autoMock, overStartMock, loadRecordMock } = vi.hoisted(() => ({
  autoMock: vi.fn<(timeout?: number) => void>(),
  overStartMock: vi.fn<() => void>(),
  loadRecordMock: vi.fn<() => unknown>(),
}));

vi.mock('@/game/controller', () => ({
  default: {
    auto: autoMock,
    overStart: overStartMock,
  },
}));

vi.mock('@/state/persist', async () => {
  const actual = await vi.importActual<typeof import('@/state/persist')>('@/state/persist');
  return {
    ...actual,
    loadRecord: loadRecordMock,
  };
});

vi.mock('@/components/decorate/Decorate', () => ({
  Decorate: () => <div data-testid="decorate" />,
}));
vi.mock('@/components/guide/Guide', () => ({ Guide: () => <div data-testid="guide" /> }));
vi.mock('@/components/keyboard/Keyboard', () => ({
  Keyboard: ({ filling }: { filling: number }) => <div data-testid="keyboard">{filling}</div>,
}));
vi.mock('@/components/logo/Logo', () => ({ Logo: () => <div data-testid="logo" /> }));
vi.mock('@/components/matrix/Matrix', () => ({ Matrix: () => <div data-testid="matrix" /> }));
vi.mock('@/components/music/Music', () => ({ Music: () => <div data-testid="music" /> }));
vi.mock('@/components/next/Next', () => ({ Next: () => <div data-testid="next" /> }));
vi.mock('@/components/number/Number', () => ({
  Number: ({ number, time }: { number?: number; time?: boolean }) => (
    <div data-testid={time ? 'clock' : 'number'}>{time ? 'clock' : number}</div>
  ),
}));
vi.mock('@/components/pause/Pause', () => ({ Pause: () => <div data-testid="pause" /> }));
vi.mock('@/components/point/Point', () => ({ Point: () => <div data-testid="point" /> }));

import App from './App';

describe('App smoke and boot logic', () => {
  beforeEach(() => {
    autoMock.mockReset();
    overStartMock.mockReset();
    loadRecordMock.mockReset();
    resetGameStore(null);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('shows idle labels and starts game-over idle path when no record exists', () => {
    loadRecordMock.mockReturnValue(null);

    render(
      <Provider store={gameStore}>
        <App />
      </Provider>,
    );

    expect(screen.getByText('起始行')).toBeTruthy();
    expect(overStartMock).toHaveBeenCalledTimes(1);
    expect(autoMock).not.toHaveBeenCalled();
  });

  it('shows playing labels when current block exists', () => {
    resetGameStore({
      cur: createBlock({ type: 'T', xy: [0, 4], timeStamp: 100 }),
      clearLines: 7,
      speedRun: 3,
    });
    loadRecordMock.mockReturnValue({ cur: { type: 'T' } });

    render(
      <Provider store={gameStore}>
        <App />
      </Provider>,
    );

    expect(screen.getByText('消除行')).toBeTruthy();
    expect(screen.getByText('级别')).toBeTruthy();
  });

  it('resumes auto-fall from a stored in-progress record', () => {
    resetGameStore({
      cur: createBlock({ type: 'I', xy: [0, 3], timeStamp: 100 }),
      pause: false,
      speedRun: 4,
    });
    loadRecordMock.mockReturnValue({ cur: { type: 'I' }, pause: false });

    render(
      <Provider store={gameStore}>
        <App />
      </Provider>,
    );

    expect(autoMock).toHaveBeenCalledWith(speeds[3] / 2);
    expect(overStartMock).not.toHaveBeenCalled();
  });

  it('re-enters idle game-over path when a record exists without active piece', () => {
    resetGameStore({ cur: null });
    loadRecordMock.mockReturnValue({ points: 100 });

    render(
      <Provider store={gameStore}>
        <App />
      </Provider>,
    );

    expect(overStartMock).toHaveBeenCalledTimes(1);
  });
});
