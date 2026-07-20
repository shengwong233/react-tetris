import { useAtomValue } from 'jotai';
import { musicAtom } from '@/state/atoms';

export function Music() {
  const on = useAtomValue(musicAtom);
  return <div className={`bg music ${on ? '' : 'off'}`} data-testid="music-indicator" />;
}
