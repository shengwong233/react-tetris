import { useEffect, useState } from 'react';
import { useAtomValue } from 'jotai';
import { i18n, lan } from '@/i18n';
import { curAtom, maxAtom, pointsAtom } from '@/state/atoms';
import { Number } from '../number/Number';

const DF = i18n.point[lan];
const ZDF = i18n.highestScore[lan];
const SLDF = i18n.lastRound[lan];

export function Point() {
  const cur = !!useAtomValue(curAtom);
  const point = useAtomValue(pointsAtom);
  const max = useAtomValue(maxAtom);
  const [label, setLabel] = useState('');
  const [number, setNumber] = useState(0);

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout> | undefined;
    if (cur) {
      setLabel(point >= max ? ZDF : DF);
      setNumber(point);
    } else {
      const toggle = () => {
        setLabel(SLDF);
        setNumber(point);
        timeout = setTimeout(() => {
          setLabel(ZDF);
          setNumber(max);
          timeout = setTimeout(toggle, 3000);
        }, 3000);
      };
      if (point !== 0) {
        toggle();
      } else {
        setLabel(ZDF);
        setNumber(max);
      }
    }
    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [cur, point, max]);

  return (
    <div data-testid="score-panel">
      <p>{label}</p>
      <Number dataTestId="score-value" number={number} />
    </div>
  );
}
