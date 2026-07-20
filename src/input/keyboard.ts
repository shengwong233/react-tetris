import { todo, type TodoKey } from './actions';

const keyMap: Record<number, TodoKey> = {
  37: 'left',
  38: 'rotate',
  39: 'right',
  40: 'down',
  32: 'space',
  83: 's',
  82: 'r',
  80: 'p',
};

let keydownActive = '';

const boardKeys = Object.keys(keyMap).map((e) => parseInt(e, 10));

const keyDown = (e: KeyboardEvent) => {
  if (e.metaKey === true || boardKeys.indexOf(e.keyCode) === -1) return;
  const type = keyMap[e.keyCode];
  if (type === keydownActive) return;
  keydownActive = type;
  todo[type].down();
};

const keyUp = (e: KeyboardEvent) => {
  if (e.metaKey === true || boardKeys.indexOf(e.keyCode) === -1) return;
  const type = keyMap[e.keyCode];
  if (type === keydownActive) {
    keydownActive = '';
  }
  todo[type].up();
};

export function bindKeyboard(): () => void {
  document.addEventListener('keydown', keyDown, true);
  document.addEventListener('keyup', keyUp, true);
  return () => {
    document.removeEventListener('keydown', keyDown, true);
    document.removeEventListener('keyup', keyUp, true);
  };
}
