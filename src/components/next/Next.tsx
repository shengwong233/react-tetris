import { useMemo } from 'react';
import { useAtomValue } from 'jotai';
import { blockShape } from '@/domain';
import type { BlockType } from '@/domain';
import { nextAtom } from '@/state/atoms';

const xy: Record<BlockType, [number, number]> = {
  I: [1, 0],
  L: [0, 0],
  J: [0, 0],
  Z: [0, 0],
  S: [0, 0],
  O: [0, 1],
  T: [0, 0],
};

export function Next() {
  const data = useAtomValue(nextAtom);
  const block = useMemo(() => {
    const empty = [
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ];
    const shape = blockShape[data];
    const result = empty.map((e) => [...e]);
    shape.forEach((m, k1) => {
      m.forEach((n, k2) => {
        if (n) {
          result[k1 + xy[data][0]][k2 + xy[data][1]] = 1;
        }
      });
    });
    return result;
  }, [data]);

  return (
    <div className="next" data-testid="next-piece">
      {block.map((arr, k1) => (
        <div key={k1}>
          {arr.map((e, k2) => (
            <b className={e ? 'c' : ''} key={k2} />
          ))}
        </div>
      ))}
    </div>
  );
}
