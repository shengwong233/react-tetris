import { useEffect, useRef, useState } from 'react';
import { useAtomValue } from 'jotai';
import { blankLine, fillLine, isClear } from '@/domain';
import type { BlockData, Matrix as MatrixType } from '@/domain';
import states from '@/game/controller';
import { curAtom, matrixAtom, resetAtom } from '@/state/atoms';

export function Matrix() {
  const matrix = useAtomValue(matrixAtom);
  const cur = useAtomValue(curAtom);
  const reset = useAtomValue(resetAtom);
  const [clearLines, setClearLines] = useState<number[] | false>(false);
  const [animateColor, setAnimateColor] = useState(2);
  const [isOver, setIsOver] = useState(false);
  const [overState, setOverState] = useState<MatrixType | null>(null);
  const clearRef = useRef(false);
  const overRef = useRef(false);

  useEffect(() => {
    const clears = isClear(matrix);
    setClearLines(clears);
    setIsOver(reset);
    if (clears && !clearRef.current) {
      clearRef.current = true;
      const anima = (callback?: () => void) => {
        setTimeout(() => {
          setAnimateColor(0);
          setTimeout(() => {
            setAnimateColor(2);
            callback?.();
          }, 100);
        }, 100);
      };
      anima(() => {
        anima(() => {
          anima(() => {
            setTimeout(() => {
              states.clearLines(matrix, clears);
              clearRef.current = false;
              setClearLines(false);
            }, 100);
          });
        });
      });
    }
    if (!clears) clearRef.current = false;
  }, [matrix, reset]);

  useEffect(() => {
    if (!isClear(matrix) && reset && !overRef.current) {
      overRef.current = true;
      let state = getResult(matrix, cur, false, 2);
      setOverState(state);
      for (let i = 0; i <= 40; i++) {
        setTimeout(
          () => {
            if (i <= 19) {
              state = state.map((row, idx) => (idx === 19 - i ? [...fillLine] : [...row]));
              setOverState(state);
            } else if (i >= 20 && i <= 39) {
              state = state.map((row, idx) => (idx === i - 20 ? [...blankLine] : [...row]));
              setOverState(state);
            } else {
              states.overEnd();
              overRef.current = false;
              setOverState(null);
            }
          },
          40 * (i + 1),
        );
      }
    }
    if (!reset) overRef.current = false;
  }, [reset, matrix, cur]);

  const display =
    isOver && overState ? overState : getResult(matrix, cur, clearLines, animateColor);

  return (
    <div className="matrix" data-testid="matrix">
      {display.map((p, k1) => (
        <p key={k1}>
          {p.map((e, k2) => (
            <b className={e === 1 ? 'c' : e === 2 ? 'd' : ''} key={k2} />
          ))}
        </p>
      ))}
    </div>
  );
}

function getResult(
  matrix: MatrixType,
  cur: BlockData | null,
  clearLines: number[] | false,
  animateColor: number,
): MatrixType {
  let result = matrix.map((row) => [...row]);
  if (clearLines) {
    clearLines.forEach((index) => {
      result[index] = Array(10).fill(animateColor);
    });
  } else if (cur) {
    const { shape, xy } = cur;
    shape.forEach((m, k1) => {
      m.forEach((n, k2) => {
        if (n && xy[0] + k1 >= 0) {
          const color = result[xy[0] + k1][xy[1] + k2] === 1 ? 2 : 1;
          result[xy[0] + k1][xy[1] + k2] = color;
        }
      });
    });
  }
  return result;
}
