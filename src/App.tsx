import { useEffect, useState, type CSSProperties } from 'react';
import { useAtomValue } from 'jotai';
import { speeds } from '@/domain';
import { i18n, lan } from '@/i18n';
import states from '@/game/controller';
import { Decorate } from '@/components/decorate/Decorate';
import { Guide } from '@/components/guide/Guide';
import { Keyboard } from '@/components/keyboard/Keyboard';
import { Logo } from '@/components/logo/Logo';
import { Matrix } from '@/components/matrix/Matrix';
import { Music } from '@/components/music/Music';
import { Next } from '@/components/next/Next';
import { Number } from '@/components/number/Number';
import { Pause } from '@/components/pause/Pause';
import { Point } from '@/components/point/Point';
import {
  clearLinesAtom,
  curAtom,
  dropAtom,
  pauseAtom,
  speedRunAtom,
  speedStartAtom,
  startLinesAtom,
} from '@/state/atoms';
import { loadRecord } from '@/state/persist';
import { gameStore } from '@/state/store';

export default function App() {
  const [size, setSize] = useState(() => ({
    w: document.documentElement.clientWidth,
    h: document.documentElement.clientHeight,
  }));
  const cur = useAtomValue(curAtom);
  const drop = useAtomValue(dropAtom);
  const clearLines = useAtomValue(clearLinesAtom);
  const startLines = useAtomValue(startLinesAtom);
  const speedRun = useAtomValue(speedRunAtom);
  const speedStart = useAtomValue(speedStartAtom);

  useEffect(() => {
    const onResize = () => {
      setSize({
        w: document.documentElement.clientWidth,
        h: document.documentElement.clientHeight,
      });
    };
    window.addEventListener('resize', onResize, true);
    return () => window.removeEventListener('resize', onResize, true);
  }, []);

  useEffect(() => {
    const record = loadRecord();
    const current = gameStore.get(curAtom);
    const pause = gameStore.get(pauseAtom);
    const run = gameStore.get(speedRunAtom);
    if (record) {
      if (current && !pause) {
        let timeout = speeds[run - 1] / 2;
        timeout = timeout < speeds[speeds.length - 1] ? speeds[speeds.length - 1] : timeout;
        states.auto(timeout);
      }
      if (!current) {
        states.overStart();
      }
    } else {
      states.overStart();
    }
  }, []);

  let filling = 0;
  const css = (() => {
    const w = Math.max(size.w, 1);
    const h = Math.max(size.h, 1);
    const ratio = h / w;
    let scale: number;
    const style: CSSProperties = {};
    if (ratio < 1.5) {
      scale = h / 960;
    } else {
      scale = w / 640;
      filling = (h - 960 * scale) / scale / 3;
      style.paddingTop = Math.floor(filling) + 42;
      style.paddingBottom = Math.floor(filling);
      style.marginTop = Math.floor(-480 - filling * 1.5);
    }
    style.transform = `scale(${scale})`;
    return style;
  })();

  return (
    <div className="app" data-testid="app" style={css}>
      <div className={`rect${drop ? ' drop' : ''}`}>
        <Decorate />
        <div className="screen">
          <div className="panel">
            <Matrix />
            <Logo />
            <div className="state">
              <Point />
              <p>{cur ? i18n.cleans[lan] : i18n.startLine[lan]}</p>
              <Number dataTestId="status-value" number={cur ? clearLines : startLines} />
              <p>{i18n.level[lan]}</p>
              <Number dataTestId="level-value" number={cur ? speedRun : speedStart} length={1} />
              <p>{i18n.next[lan]}</p>
              <Next />
              <div className="bottom">
                <Music />
                <Pause />
                <Number dataTestId="clock-value" time />
              </div>
            </div>
          </div>
        </div>
      </div>
      <Keyboard filling={filling} />
      <Guide />
    </div>
  );
}
