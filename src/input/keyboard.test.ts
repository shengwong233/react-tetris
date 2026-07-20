// @vitest-environment happy-dom

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const { todo } = vi.hoisted(() => ({
  todo: {
    left: { down: vi.fn<() => void>(), up: vi.fn<() => void>() },
    right: { down: vi.fn<() => void>(), up: vi.fn<() => void>() },
    down: { down: vi.fn<() => void>(), up: vi.fn<() => void>() },
    rotate: { down: vi.fn<() => void>(), up: vi.fn<() => void>() },
    space: { down: vi.fn<() => void>(), up: vi.fn<() => void>() },
    s: { down: vi.fn<() => void>(), up: vi.fn<() => void>() },
    r: { down: vi.fn<() => void>(), up: vi.fn<() => void>() },
    p: { down: vi.fn<() => void>(), up: vi.fn<() => void>() },
  },
}));

vi.mock('./actions', () => ({ todo }));

import { bindKeyboard } from './keyboard';

function keyEvent(type: 'keydown' | 'keyup', keyCode: number, metaKey = false) {
  const event = new KeyboardEvent(type, { bubbles: true, metaKey });
  Object.defineProperty(event, 'keyCode', { value: keyCode });
  return event;
}

describe('keyboard binding', () => {
  let unbind: () => void;

  beforeEach(() => {
    Object.values(todo).forEach((entry) => {
      entry.down.mockReset();
      entry.up.mockReset();
    });
    unbind = bindKeyboard();
  });

  afterEach(() => {
    unbind();
  });

  it('dispatches mapped key down and up handlers', () => {
    document.dispatchEvent(keyEvent('keydown', 37));
    document.dispatchEvent(keyEvent('keyup', 37));

    expect(todo.left.down).toHaveBeenCalledTimes(1);
    expect(todo.left.up).toHaveBeenCalledTimes(1);
  });

  it('ignores duplicate keydown until keyup resets active key', () => {
    document.dispatchEvent(keyEvent('keydown', 38));
    document.dispatchEvent(keyEvent('keydown', 38));
    document.dispatchEvent(keyEvent('keyup', 38));
    document.dispatchEvent(keyEvent('keydown', 38));

    expect(todo.rotate.down).toHaveBeenCalledTimes(2);
    expect(todo.rotate.up).toHaveBeenCalledTimes(1);
  });

  it('ignores meta-modified or unmapped keys', () => {
    document.dispatchEvent(keyEvent('keydown', 37, true));
    document.dispatchEvent(keyEvent('keydown', 13));

    expect(todo.left.down).not.toHaveBeenCalled();
  });

  it('removes listeners on cleanup', () => {
    unbind();
    document.dispatchEvent(keyEvent('keydown', 39));
    document.dispatchEvent(keyEvent('keyup', 39));

    expect(todo.right.down).not.toHaveBeenCalled();
    expect(todo.right.up).not.toHaveBeenCalled();
  });
});
