import { useEffect, useState } from 'react';
import { useAtomValue } from 'jotai';
import { pauseAtom } from '@/state/atoms';

export function Pause() {
  const pause = useAtomValue(pauseAtom);
  const [showPause, setShowPause] = useState(false);

  useEffect(() => {
    if (!pause) {
      setShowPause(false);
      return;
    }
    const id = setInterval(() => setShowPause((v) => !v), 250);
    return () => clearInterval(id);
  }, [pause]);

  return <div className={`bg pause${showPause ? ' c' : ''}`} data-testid="pause-indicator" />;
}
