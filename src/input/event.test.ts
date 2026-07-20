import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import event from './event';

describe('input event scheduler', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    event.clearAll();
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('fires once immediately in once mode', () => {
    const callback = vi.fn<() => void>();

    event.down({ key: 'space', once: true, callback });
    vi.advanceTimersByTime(500);

    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('repeats after begin and interval delays', () => {
    const callback = vi.fn<() => void>();

    event.down({ key: 'left', begin: 200, interval: 100, callback });

    expect(callback).toHaveBeenCalledTimes(1);
    vi.advanceTimersByTime(199);
    expect(callback).toHaveBeenCalledTimes(1);
    vi.advanceTimersByTime(1);
    expect(callback).toHaveBeenCalledTimes(2);
    vi.advanceTimersByTime(100);
    expect(callback).toHaveBeenCalledTimes(3);
  });

  it('clears previous key timers when a new key starts', () => {
    const left = vi.fn<() => void>();
    const right = vi.fn<() => void>();

    event.down({ key: 'left', begin: 50, interval: 50, callback: left });
    vi.advanceTimersByTime(25);
    event.down({ key: 'right', begin: 50, interval: 50, callback: right });
    vi.advanceTimersByTime(100);

    expect(left).toHaveBeenCalledTimes(1);
    expect(right).toHaveBeenCalledTimes(3);
  });

  it('supports manual up and clearAll', () => {
    const callback = vi.fn<() => void>();
    const onUp = vi.fn<() => void>();

    event.down({ key: 'down', begin: 50, interval: 50, callback });
    vi.advanceTimersByTime(50);
    expect(callback).toHaveBeenCalledTimes(2);

    event.up({ key: 'down', callback: onUp });
    vi.advanceTimersByTime(100);
    expect(callback).toHaveBeenCalledTimes(2);
    expect(onUp).toHaveBeenCalledTimes(1);

    event.down({ key: 'rotate', begin: 50, interval: 50, callback });
    event.clearAll();
    vi.advanceTimersByTime(100);
    expect(callback).toHaveBeenCalledTimes(3);
  });
});
