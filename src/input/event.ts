type DownOptions = {
  key: string;
  begin?: number;
  interval?: number;
  once?: boolean;
  callback: (clear: () => void) => void;
};

type UpOptions = {
  key: string;
  callback?: () => void;
};

const eventName: Record<string, ReturnType<typeof setTimeout> | null> = {};

const down = (o: DownOptions) => {
  Object.keys(eventName).forEach((i) => {
    const t = eventName[i];
    if (t) clearTimeout(t);
    eventName[i] = null;
  });
  if (!o.callback) return;

  const clear = () => {
    const t = eventName[o.key];
    if (t) clearTimeout(t);
  };

  o.callback(clear);
  if (o.once === true) return;

  let begin: number | null = o.begin ?? 100;
  const interval = o.interval ?? 50;
  const loop = () => {
    eventName[o.key] = setTimeout(() => {
      begin = null;
      loop();
      o.callback(clear);
    }, begin || interval);
  };
  loop();
};

const up = (o: UpOptions) => {
  const t = eventName[o.key];
  if (t) clearTimeout(t);
  eventName[o.key] = null;
  o.callback?.();
};

const clearAll = () => {
  Object.keys(eventName).forEach((i) => {
    const t = eventName[i];
    if (t) clearTimeout(t);
    eventName[i] = null;
  });
};

export default { down, up, clearAll };
