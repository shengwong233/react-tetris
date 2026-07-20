import { useEffect, useRef, useState } from 'react';
import { useAtomValue } from 'jotai';
import { i18n, lan } from '@/i18n';
import { curAtom, resetAtom } from '@/state/atoms';

export function Logo() {
  const cur = !!useAtomValue(curAtom);
  const reset = useAtomValue(resetAtom);
  const [frame, setFrame] = useState('r1');
  const [display, setDisplay] = useState('none');
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const clear = () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
    clear();
    setFrame('r1');
    setDisplay('none');
    if (cur || reset) return;

    let m: 'r' | 'l' = 'r';
    let count = 0;

    const set = (func: (() => void) | undefined, delay: number) => {
      if (!func) return;
      timeoutRef.current = setTimeout(func, delay);
    };

    const show = (func?: () => void) => {
      set(() => {
        setDisplay('block');
        func?.();
      }, 150);
    };
    const hide = (func?: () => void) => {
      set(() => {
        setDisplay('none');
        func?.();
      }, 150);
    };
    const eyes = (func: () => void, delay1: number, delay2: number) => {
      set(() => {
        setFrame(m + '2');
        set(() => {
          setFrame(m + '1');
          func();
        }, delay2);
      }, delay1);
    };
    const run = (func: () => void) => {
      set(() => {
        setFrame(m + '4');
        set(() => {
          setFrame(m + '3');
          count++;
          if (count === 10 || count === 20 || count === 30) {
            m = m === 'r' ? 'l' : 'r';
          }
          if (count < 40) {
            run(func);
            return;
          }
          setFrame(m + '1');
          set(func, 4000);
        }, 100);
      }, 100);
    };
    const dra = () => {
      count = 0;
      eyes(
        () => {
          eyes(
            () => {
              eyes(
                () => {
                  setFrame(m + '2');
                  run(dra);
                },
                150,
                150,
              );
            },
            150,
            150,
          );
        },
        1000,
        1500,
      );
    };

    show(() => {
      hide(() => {
        show(() => {
          hide(() => {
            show(() => {
              dra();
            });
          });
        });
      });
    });

    return clear;
  }, [cur, reset]);

  if (cur) return null;

  return (
    <div className="logo" style={{ display }}>
      <div className={`bg dragon ${frame}`} />
      <p dangerouslySetInnerHTML={{ __html: i18n.titleCenter[lan] }} />
    </div>
  );
}
