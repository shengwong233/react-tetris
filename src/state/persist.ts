import {
  blankMatrix,
  blockType,
  clampPoints,
  createBlock,
  getNextType,
  maxPoint,
  StorageKey,
} from '@/domain';
import type { BlockData, BlockType, GameState, KeyboardState, Matrix } from '@/domain';

export const defaultKeyboard: KeyboardState = {
  drop: false,
  down: false,
  left: false,
  right: false,
  rotate: false,
  reset: false,
  music: false,
  pause: false,
};

function isBlockType(v: unknown): v is BlockType {
  return typeof v === 'string' && (blockType as string[]).includes(v);
}

function parseMatrix(raw: unknown): Matrix | null {
  if (!Array.isArray(raw) || raw.length !== 20) return null;
  const matrix: Matrix = [];
  for (const row of raw) {
    if (!Array.isArray(row) || row.length !== 10) return null;
    matrix.push(row.map((n) => (n ? 1 : 0)));
  }
  return matrix;
}

function parseCur(raw: unknown): BlockData | null {
  if (!raw || typeof raw !== 'object') return null;
  const cur = raw as Record<string, unknown>;
  if (!isBlockType(cur.type)) return null;
  if (!Array.isArray(cur.shape) || !Array.isArray(cur.xy)) return null;
  return createBlock({
    type: cur.type,
    rotateIndex: typeof cur.rotateIndex === 'number' ? cur.rotateIndex : 0,
    shape: cur.shape as number[][],
    xy: cur.xy as [number, number],
    timeStamp: typeof cur.timeStamp === 'number' ? cur.timeStamp : Date.now(),
  });
}

export function encodeState(state: GameState): string {
  let data = JSON.stringify(state);
  data = encodeURIComponent(data);
  if (typeof window !== 'undefined' && window.btoa) {
    data = window.btoa(data);
  }
  return data;
}

export function decodeState(raw: string): Partial<GameState> | null {
  try {
    let data = raw;
    if (typeof window !== 'undefined' && window.atob) {
      try {
        data = window.atob(data);
      } catch {
        // already decoded or plain
      }
    }
    data = decodeURIComponent(data);
    return JSON.parse(data) as Partial<GameState>;
  } catch (e) {
    console.error('读取记录错误:', e);
    return null;
  }
}

export function loadRecord(): Partial<GameState> | null {
  if (typeof localStorage === 'undefined') return null;
  const raw = localStorage.getItem(StorageKey);
  if (!raw) return null;
  return decodeState(raw);
}

export function saveRecord(state: GameState): void {
  if (typeof localStorage === 'undefined') return;
  if (state.lock) return;
  localStorage.setItem(StorageKey, encodeState(state));
}

export function hasWebAudio(): boolean {
  if (typeof window === 'undefined') return false;
  const AC =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  return !!AC && location.protocol.indexOf('http') !== -1;
}

export function createInitialState(record: Partial<GameState> | null = loadRecord()): GameState {
  const matrix = parseMatrix(record?.matrix) ?? blankMatrix.map((r) => [...r]);
  const next = isBlockType(record?.next) ? record!.next! : getNextType();
  const cur = parseCur(record?.cur);
  const music = hasWebAudio() ? (typeof record?.music === 'boolean' ? record.music : true) : false;

  const points = clampPoints(typeof record?.points === 'number' ? record.points : 0);
  let max = typeof record?.max === 'number' ? record.max : 0;
  if (max < 0) max = 0;
  if (max > maxPoint) max = maxPoint;

  let startLines = typeof record?.startLines === 'number' ? record.startLines : 0;
  if (startLines < 0) startLines = 0;
  if (startLines > 10) startLines = 10;

  let speedStart = typeof record?.speedStart === 'number' ? record.speedStart : 1;
  if (speedStart < 1) speedStart = 1;
  if (speedStart > 6) speedStart = 6;

  let speedRun = typeof record?.speedRun === 'number' ? record.speedRun : speedStart;
  if (speedRun < 1) speedRun = 1;
  if (speedRun > 6) speedRun = 6;

  let clearLines = typeof record?.clearLines === 'number' ? record.clearLines : 0;
  if (clearLines < 0) clearLines = 0;

  return {
    pause: !!record?.pause,
    music,
    matrix,
    next,
    cur,
    startLines,
    max,
    points,
    speedStart,
    speedRun,
    lock: false,
    clearLines,
    reset: false,
    drop: false,
    keyboard: { ...defaultKeyboard },
    focus: true,
  };
}
