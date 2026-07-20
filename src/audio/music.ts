import { gameStore } from '@/state/store';
import { musicAtom } from '@/state/atoms';
import { hasWebAudio } from '@/state/persist';

type MusicApi = {
  start?: () => void;
  clear?: () => void;
  fall?: () => void;
  gameover?: () => void;
  rotate?: () => void;
  move?: () => void;
  killStart?: () => void;
};

export const music: MusicApi = {};

export const webAudioAvailable = { data: hasWebAudio() };

(() => {
  if (!webAudioAvailable.data || typeof window === 'undefined') return;

  const AudioCtx =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioCtx) {
    webAudioAvailable.data = false;
    return;
  }

  const context = new AudioCtx();
  const req = new XMLHttpRequest();
  req.open('GET', '/music.mp3', true);
  req.responseType = 'arraybuffer';

  req.onload = () => {
    context.decodeAudioData(
      req.response,
      (buf) => {
        const getSource = () => {
          const source = context.createBufferSource();
          source.buffer = buf;
          source.connect(context.destination);
          return source;
        };

        const enabled = () => gameStore.get(musicAtom);

        music.killStart = () => {
          music.start = () => {};
        };

        music.start = () => {
          music.killStart?.();
          if (!enabled()) return;
          getSource().start(0, 3.7202, 3.6224);
        };

        music.clear = () => {
          if (!enabled()) return;
          getSource().start(0, 0, 0.7675);
        };

        music.fall = () => {
          if (!enabled()) return;
          getSource().start(0, 1.2558, 0.3546);
        };

        music.gameover = () => {
          if (!enabled()) return;
          getSource().start(0, 8.1276, 1.1437);
        };

        music.rotate = () => {
          if (!enabled()) return;
          getSource().start(0, 2.2471, 0.0807);
        };

        music.move = () => {
          if (!enabled()) return;
          getSource().start(0, 2.9088, 0.1437);
        };
      },
      (error) => {
        console.error('音频: /music.mp3 读取错误', error);
        webAudioAvailable.data = false;
      },
    );
  };

  req.send();
})();
