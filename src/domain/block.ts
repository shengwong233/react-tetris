import { blockShape, origin } from './const';
import type { BlockData, BlockType, Shape } from './types';

function cloneShape(shape: Shape): Shape {
  return shape.map((row) => [...row]);
}

function defaultXy(type: BlockType): [number, number] {
  return type === 'I' ? [0, 3] : [-1, 4];
}

export function createBlock(option: {
  type: BlockType;
  rotateIndex?: number;
  timeStamp?: number;
  shape?: Shape;
  xy?: [number, number];
}): BlockData {
  return {
    type: option.type,
    rotateIndex: option.rotateIndex ?? 0,
    timeStamp: option.timeStamp ?? Date.now(),
    shape: option.shape ? cloneShape(option.shape) : cloneShape(blockShape[option.type]),
    xy: option.xy ? [...option.xy] : defaultXy(option.type),
  };
}

export function rotate(block: BlockData): BlockData {
  const { shape } = block;
  const result: Shape = [];
  shape.forEach((m) => {
    m.forEach((n, k) => {
      const index = m.length - k - 1;
      if (result[index] === undefined) {
        result[index] = [];
      }
      result[index].push(n);
    });
  });
  const offset = origin[block.type][block.rotateIndex];
  const nextXy: [number, number] = [block.xy[0] + offset[0], block.xy[1] + offset[1]];
  const nextRotateIndex =
    block.rotateIndex + 1 >= origin[block.type].length ? 0 : block.rotateIndex + 1;
  return {
    shape: result,
    type: block.type,
    xy: nextXy,
    rotateIndex: nextRotateIndex,
    timeStamp: block.timeStamp,
  };
}

export function fall(block: BlockData, n = 1): BlockData {
  return {
    ...block,
    shape: cloneShape(block.shape),
    xy: [block.xy[0] + n, block.xy[1]],
    timeStamp: Date.now(),
  };
}

export function right(block: BlockData): BlockData {
  return {
    ...block,
    shape: cloneShape(block.shape),
    xy: [block.xy[0], block.xy[1] + 1],
  };
}

export function left(block: BlockData): BlockData {
  return {
    ...block,
    shape: cloneShape(block.shape),
    xy: [block.xy[0], block.xy[1] - 1],
  };
}
