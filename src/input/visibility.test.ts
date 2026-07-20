// @vitest-environment happy-dom

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const { focusMock } = vi.hoisted(() => ({
  focusMock: vi.fn<(isFocus: boolean) => void>(),
}));

vi.mock('@/game/controller', () => ({
  default: {
    focus: focusMock,
  },
}));

import { bindVisibility, isFocus, visibilityChangeEvent } from './visibility';

describe('visibility binding', () => {
  beforeEach(() => {
    focusMock.mockReset();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('reports focus from document.hidden when supported', () => {
    Object.defineProperty(document, 'hidden', { configurable: true, value: false });
    expect(isFocus()).toBe(true);

    Object.defineProperty(document, 'hidden', { configurable: true, value: true });
    expect(isFocus()).toBe(false);
  });

  it('binds visibilitychange and forwards focus state', () => {
    const unbind = bindVisibility();
    expect(typeof unbind).toBe('function');

    if (!visibilityChangeEvent) {
      return;
    }

    Object.defineProperty(document, 'hidden', { configurable: true, value: true });

    document.dispatchEvent(new Event(visibilityChangeEvent));
    expect(focusMock).toHaveBeenCalledWith(false);

    focusMock.mockReset();
    unbind();
    Object.defineProperty(document, 'hidden', { configurable: true, value: false });
    document.dispatchEvent(new Event(visibilityChangeEvent));
    expect(focusMock).not.toHaveBeenCalled();
  });
});
