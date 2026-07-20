import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { blankMatrix, StorageKey, createBlock } from '@/domain';
import type { GameState } from '@/domain';
import {
  createInitialState,
  decodeState,
  defaultKeyboard,
  encodeState,
  hasWebAudio,
  loadRecord,
  saveRecord,
} from './persist';

type StorageMap = Record<string, string>;

function createStorage() {
  const store: StorageMap = {};
  return {
    store,
    api: {
      getItem(key: string) {
        return store[key] ?? null;
      },
      setItem(key: string, value: string) {
        store[key] = value;
      },
      removeItem(key: string) {
        delete store[key];
      },
      clear() {
        for (const key of Object.keys(store)) {
          delete store[key];
        }
      },
    },
  };
}

function createState(overrides: Partial<GameState> = {}): GameState {
  return {
    pause: false,
    music: true,
    matrix: blankMatrix.map((row) => [...row]),
    next: 'I',
    cur: createBlock({ type: 'T', xy: [1, 4], timeStamp: 123 }),
    startLines: 2,
    max: 200,
    points: 100,
    speedStart: 2,
    speedRun: 3,
    lock: false,
    clearLines: 4,
    reset: false,
    drop: false,
    keyboard: { ...defaultKeyboard },
    focus: true,
    ...overrides,
  };
}

describe('persist helpers', () => {
  const originalWindow = globalThis.window;
  const originalLocalStorage = globalThis.localStorage;
  const originalLocation = globalThis.location;
  let storage: ReturnType<typeof createStorage>;

  beforeEach(() => {
    storage = createStorage();
    vi.stubGlobal('localStorage', storage.api);
    vi.stubGlobal('location', { protocol: 'https:' });
    vi.stubGlobal('window', {
      btoa: (value: string) => Buffer.from(value, 'utf8').toString('base64'),
      atob: (value: string) => Buffer.from(value, 'base64').toString('utf8'),
      AudioContext: function AudioContextMock() {},
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    if (originalWindow !== undefined) {
      vi.stubGlobal('window', originalWindow);
    }
    if (originalLocalStorage !== undefined) {
      vi.stubGlobal('localStorage', originalLocalStorage);
    }
    if (originalLocation !== undefined) {
      vi.stubGlobal('location', originalLocation);
    }
  });

  it('encodes and decodes game state round-trip', () => {
    const state = createState();
    const encoded = encodeState(state);

    expect(typeof encoded).toBe('string');
    expect(decodeState(encoded)).toEqual(state);
  });

  it('saves unlocked state and skips locked state', () => {
    const unlocked = createState();
    saveRecord(unlocked);
    expect(storage.store[StorageKey]).toBeTruthy();

    const previous = storage.store[StorageKey];
    saveRecord(createState({ lock: true, points: 999 }));

    expect(storage.store[StorageKey]).toBe(previous);
  });

  it('loads stored record and returns null for corrupt data', () => {
    const state = createState();
    storage.api.setItem(StorageKey, encodeState(state));
    expect(loadRecord()).toEqual(state);

    storage.api.setItem(StorageKey, 'not-valid');
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(loadRecord()).toBeNull();
    errorSpy.mockRestore();
  });

  it('detects web audio availability from window and protocol', () => {
    expect(hasWebAudio()).toBe(true);

    vi.stubGlobal('location', { protocol: 'file:' });
    expect(hasWebAudio()).toBe(false);

    vi.stubGlobal('window', { btoa: window.btoa, atob: window.atob });
    vi.stubGlobal('location', { protocol: 'https:' });
    expect(hasWebAudio()).toBe(false);
  });

  it('sanitizes restored state and rebuilds current block', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0);

    const restored = createInitialState({
      matrix: [[1]],
      next: 'X' as never,
      cur: {
        type: 'L',
        shape: [
          [0, 0, 1],
          [1, 1, 1],
        ],
        xy: [-1, 4],
        rotateIndex: 0,
        timeStamp: 456,
      },
      music: true,
      points: 1_000_000,
      max: -5,
      startLines: 99,
      speedStart: 0,
      speedRun: 10,
      clearLines: -3,
      pause: true,
    } as Partial<GameState>);

    expect(restored.matrix).toEqual(blankMatrix);
    expect(restored.next).toBe('I');
    expect(restored.cur).toMatchObject({
      type: 'L',
      xy: [-1, 4],
      rotateIndex: 0,
      timeStamp: 456,
    });
    expect(restored.points).toBe(999999);
    expect(restored.max).toBe(0);
    expect(restored.startLines).toBe(10);
    expect(restored.speedStart).toBe(1);
    expect(restored.speedRun).toBe(6);
    expect(restored.clearLines).toBe(0);
    expect(restored.pause).toBe(true);
    expect(restored.music).toBe(true);
    expect(restored.keyboard).toEqual(defaultKeyboard);
    expect(restored.lock).toBe(false);
  });

  it('falls back to defaults when no record is present', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0);

    const state = createInitialState(null);

    expect(state.next).toBe('I');
    expect(state.cur).toBeNull();
    expect(state.matrix).toEqual(blankMatrix);
    expect(state.music).toBe(true);
  });
});
