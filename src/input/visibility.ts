import states from '@/game/controller';

const hiddenProperty = (() => {
  const names = ['hidden', 'webkitHidden', 'mozHidden', 'msHidden'] as const;
  const found = names.find((e) => e in document);
  return found || false;
})();

export const visibilityChangeEvent = (() => {
  if (!hiddenProperty) return false;
  return hiddenProperty.replace(/hidden/i, 'visibilitychange');
})();

export const isFocus = () => {
  if (!hiddenProperty) return true;
  return !document[hiddenProperty as 'hidden'];
};

export function bindVisibility(): () => void {
  if (!visibilityChangeEvent) return () => {};
  const handler = () => {
    states.focus(isFocus());
  };
  document.addEventListener(visibilityChangeEvent, handler, false);
  return () => {
    document.removeEventListener(visibilityChangeEvent, handler, false);
  };
}
