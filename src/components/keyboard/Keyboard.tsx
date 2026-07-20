import { useEffect, useRef } from 'react';
import { useAtomValue } from 'jotai';
import { i18n, lan } from '@/i18n';
import { todo, type TodoKey } from '@/input/actions';
import { keyboardAtom } from '@/state/atoms';
import { Button } from './Button';

type Props = { filling: number };

export function Keyboard({ filling }: Props) {
  const keyboard = useAtomValue(keyboardAtom);
  const touchEventCatch = useRef<Partial<Record<TodoKey, boolean>>>({});
  const mouseDownEventCatch = useRef<Partial<Record<TodoKey, boolean>>>({});

  useEffect(() => {
    const prevent = (e: Event) => e.preventDefault();
    document.addEventListener('touchstart', prevent, true);
    document.addEventListener('touchend', prevent, true);
    document.addEventListener('gesturestart', prevent as EventListener);

    return () => {
      document.removeEventListener('touchstart', prevent, true);
      document.removeEventListener('touchend', prevent, true);
      document.removeEventListener('gesturestart', prevent as EventListener);
    };
  }, []);

  const bindHandlers = (key: TodoKey) => {
    const onMouseDown = () => {
      if (touchEventCatch.current[key]) return;
      todo[key].down();
      mouseDownEventCatch.current[key] = true;
    };
    const onMouseUp = () => {
      if (touchEventCatch.current[key]) {
        touchEventCatch.current[key] = false;
        return;
      }
      todo[key].up();
      mouseDownEventCatch.current[key] = false;
    };
    const onMouseLeave = () => {
      if (mouseDownEventCatch.current[key]) {
        todo[key].up();
        mouseDownEventCatch.current[key] = false;
      }
    };
    const onTouchStart = () => {
      touchEventCatch.current[key] = true;
      todo[key].down();
    };
    const onTouchEnd = () => {
      todo[key].up();
    };
    return { onMouseDown, onMouseUp, onMouseLeave, onTouchStart, onTouchEnd };
  };

  return (
    <div className="keyboard" style={{ marginTop: 20 + filling }}>
      <Button
        color="blue"
        size="s1"
        dataTestId="btn-rotate"
        top={0}
        left={374}
        label={i18n.rotation[lan]}
        arrow="translate(0, 63px)"
        position
        active={keyboard.rotate}
        {...bindHandlers('rotate')}
      />
      <Button
        color="blue"
        size="s1"
        dataTestId="btn-down"
        top={180}
        left={374}
        label={i18n.down[lan]}
        arrow="translate(0,-55px) rotate(180deg)"
        active={keyboard.down}
        {...bindHandlers('down')}
      />
      <Button
        color="blue"
        size="s1"
        dataTestId="btn-left"
        top={90}
        left={284}
        label={i18n.left[lan]}
        arrow="translate(60px, 6px) rotate(270deg)"
        active={keyboard.left}
        {...bindHandlers('left')}
      />
      <Button
        color="blue"
        size="s1"
        dataTestId="btn-right"
        top={90}
        left={464}
        label={i18n.right[lan]}
        arrow="translate(-60px, 6px) rotate(90deg)"
        active={keyboard.right}
        {...bindHandlers('right')}
      />
      <Button
        color="blue"
        size="s0"
        dataTestId="btn-drop"
        top={100}
        left={52}
        label={`${i18n.drop[lan]} (SPACE)`}
        active={keyboard.drop}
        {...bindHandlers('space')}
      />
      <Button
        color="red"
        size="s2"
        dataTestId="btn-reset"
        top={0}
        left={196}
        label={`${i18n.reset[lan]}(R)`}
        active={keyboard.reset}
        {...bindHandlers('r')}
      />
      <Button
        color="green"
        size="s2"
        dataTestId="btn-sound"
        top={0}
        left={106}
        label={`${i18n.sound[lan]}(S)`}
        active={keyboard.music}
        {...bindHandlers('s')}
      />
      <Button
        color="green"
        size="s2"
        dataTestId="btn-pause"
        top={0}
        left={16}
        label={`${i18n.pause[lan]}(P)`}
        active={keyboard.pause}
        {...bindHandlers('p')}
      />
    </div>
  );
}
