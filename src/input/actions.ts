import {
  delays,
  fall,
  left as moveLeft,
  lockPiece,
  right as moveRight,
  rotate as rotateBlock,
  speeds,
  want,
} from '@/domain';
import { music } from '@/audio/music';
import states from '@/game/controller';
import type { KeyboardState } from '@/domain';
import {
  curAtom,
  dropAtom,
  keyboardAtom,
  lockAtom,
  matrixAtom,
  musicAtom,
  pauseAtom,
  speedRunAtom,
  speedStartAtom,
  startLinesAtom,
} from '@/state/atoms';
import { gameStore } from '@/state/store';
import { hasWebAudio } from '@/state/persist';
import event from './event';

function setKey(key: keyof KeyboardState, value: boolean) {
  const kb = gameStore.get(keyboardAtom);
  gameStore.set(keyboardAtom, { ...kb, [key]: value });
}

export const left = {
  down: () => {
    setKey('left', true);
    event.down({
      key: 'left',
      begin: 200,
      interval: 100,
      callback: () => {
        if (gameStore.get(lockAtom)) return;
        music.move?.();
        const cur = gameStore.get(curAtom);
        if (cur !== null) {
          if (gameStore.get(pauseAtom)) {
            states.pause(false);
            return;
          }
          const next = moveLeft(cur);
          const delay = delays[gameStore.get(speedRunAtom) - 1];
          let timeStamp: number;
          if (want(next, gameStore.get(matrixAtom))) {
            next.timeStamp += delay;
            gameStore.set(curAtom, next);
            timeStamp = next.timeStamp;
          } else {
            const bumped = { ...cur, timeStamp: cur.timeStamp + Math.floor(delay / 1.5) };
            gameStore.set(curAtom, bumped);
            timeStamp = bumped.timeStamp;
          }
          const remain = speeds[gameStore.get(speedRunAtom) - 1] - (Date.now() - timeStamp);
          states.auto(remain);
        } else {
          let speed = gameStore.get(speedStartAtom);
          speed = speed - 1 < 1 ? 6 : speed - 1;
          gameStore.set(speedStartAtom, speed);
        }
      },
    });
  },
  up: () => {
    setKey('left', false);
    event.up({ key: 'left' });
  },
};

export const right = {
  down: () => {
    setKey('right', true);
    event.down({
      key: 'right',
      begin: 200,
      interval: 100,
      callback: () => {
        if (gameStore.get(lockAtom)) return;
        music.move?.();
        const cur = gameStore.get(curAtom);
        if (cur !== null) {
          if (gameStore.get(pauseAtom)) {
            states.pause(false);
            return;
          }
          const next = moveRight(cur);
          const delay = delays[gameStore.get(speedRunAtom) - 1];
          let timeStamp: number;
          if (want(next, gameStore.get(matrixAtom))) {
            next.timeStamp += delay;
            gameStore.set(curAtom, next);
            timeStamp = next.timeStamp;
          } else {
            const bumped = { ...cur, timeStamp: cur.timeStamp + Math.floor(delay / 1.5) };
            gameStore.set(curAtom, bumped);
            timeStamp = bumped.timeStamp;
          }
          const remain = speeds[gameStore.get(speedRunAtom) - 1] - (Date.now() - timeStamp);
          states.auto(remain);
        } else {
          let speed = gameStore.get(speedStartAtom);
          speed = speed + 1 > 6 ? 1 : speed + 1;
          gameStore.set(speedStartAtom, speed);
        }
      },
    });
  },
  up: () => {
    setKey('right', false);
    event.up({ key: 'right' });
  },
};

export const down = {
  down: () => {
    setKey('down', true);
    if (gameStore.get(curAtom) !== null) {
      event.down({
        key: 'down',
        begin: 40,
        interval: 40,
        callback: (stopDownTrigger) => {
          if (gameStore.get(lockAtom)) return;
          music.move?.();
          const cur = gameStore.get(curAtom);
          if (cur === null) return;
          if (gameStore.get(pauseAtom)) {
            states.pause(false);
            return;
          }
          const next = fall(cur);
          if (want(next, gameStore.get(matrixAtom))) {
            gameStore.set(curAtom, next);
            states.auto();
          } else {
            const locked = lockPiece(gameStore.get(matrixAtom), cur);
            states.nextAround(locked, stopDownTrigger);
          }
        },
      });
    } else {
      event.down({
        key: 'down',
        begin: 200,
        interval: 100,
        callback: () => {
          if (gameStore.get(lockAtom)) return;
          if (gameStore.get(curAtom)) return;
          music.move?.();
          let startLines = gameStore.get(startLinesAtom);
          startLines = startLines - 1 < 0 ? 10 : startLines - 1;
          gameStore.set(startLinesAtom, startLines);
        },
      });
    }
  },
  up: () => {
    setKey('down', false);
    event.up({ key: 'down' });
  },
};

export const rotate = {
  down: () => {
    setKey('rotate', true);
    if (gameStore.get(curAtom) !== null) {
      event.down({
        key: 'rotate',
        once: true,
        callback: () => {
          if (gameStore.get(lockAtom)) return;
          if (gameStore.get(pauseAtom)) states.pause(false);
          const cur = gameStore.get(curAtom);
          if (cur === null) return;
          music.rotate?.();
          const next = rotateBlock(cur);
          if (want(next, gameStore.get(matrixAtom))) {
            gameStore.set(curAtom, next);
          }
        },
      });
    } else {
      event.down({
        key: 'rotate',
        begin: 200,
        interval: 100,
        callback: () => {
          if (gameStore.get(lockAtom)) return;
          if (gameStore.get(curAtom)) return;
          music.move?.();
          let startLines = gameStore.get(startLinesAtom);
          startLines = startLines + 1 > 10 ? 0 : startLines + 1;
          gameStore.set(startLinesAtom, startLines);
        },
      });
    }
  },
  up: () => {
    setKey('rotate', false);
    event.up({ key: 'rotate' });
  },
};

export const space = {
  down: () => {
    setKey('drop', true);
    event.down({
      key: 'space',
      once: true,
      callback: () => {
        if (gameStore.get(lockAtom)) return;
        const cur = gameStore.get(curAtom);
        if (cur !== null) {
          if (gameStore.get(pauseAtom)) {
            states.pause(false);
            return;
          }
          music.fall?.();
          let index = 0;
          let bottom = fall(cur, index);
          const matrix = gameStore.get(matrixAtom);
          while (want(bottom, matrix)) {
            bottom = fall(cur, index);
            index++;
          }
          bottom = fall(cur, index - 2);
          gameStore.set(curAtom, bottom);
          const locked = lockPiece(matrix, bottom);
          gameStore.set(dropAtom, true);
          setTimeout(() => gameStore.set(dropAtom, false), 100);
          states.nextAround(locked);
        } else {
          states.start();
        }
      },
    });
  },
  up: () => {
    setKey('drop', false);
    event.up({ key: 'space' });
  },
};

export const p = {
  down: () => {
    setKey('pause', true);
    event.down({
      key: 'p',
      once: true,
      callback: () => {
        if (gameStore.get(lockAtom)) return;
        const cur = gameStore.get(curAtom);
        const isPause = gameStore.get(pauseAtom);
        if (cur !== null) {
          states.pause(!isPause);
        } else {
          states.start();
        }
      },
    });
  },
  up: () => {
    setKey('pause', false);
    event.up({ key: 'p' });
  },
};

export const r = {
  down: () => {
    setKey('reset', true);
    if (gameStore.get(lockAtom)) return;
    if (gameStore.get(curAtom) !== null) {
      event.down({
        key: 'r',
        once: true,
        callback: () => {
          states.overStart();
        },
      });
    } else {
      event.down({
        key: 'r',
        once: true,
        callback: () => {
          if (gameStore.get(lockAtom)) return;
          states.start();
        },
      });
    }
  },
  up: () => {
    setKey('reset', false);
    event.up({ key: 'r' });
  },
};

export const s = {
  down: () => {
    setKey('music', true);
    if (gameStore.get(lockAtom)) return;
    event.down({
      key: 's',
      once: true,
      callback: () => {
        if (gameStore.get(lockAtom)) return;
        if (!hasWebAudio()) {
          gameStore.set(musicAtom, false);
          return;
        }
        gameStore.set(musicAtom, !gameStore.get(musicAtom));
      },
    });
  },
  up: () => {
    setKey('music', false);
    event.up({ key: 's' });
  },
};

export const todo = {
  left,
  right,
  down,
  rotate,
  space,
  p,
  r,
  s,
};

export type TodoKey = keyof typeof todo;
