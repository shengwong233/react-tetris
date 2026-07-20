import { useEffect, useState } from 'react';

type Props = {
  number?: number;
  length?: number;
  time?: boolean;
  dataTestId?: string;
};

const formate = (num: number) => (num < 10 ? `0${num}`.split('') : `${num}`.split(''));

function renderDigits(data: string[], dataTestId?: string) {
  return (
    <div className="number" data-testid={dataTestId}>
      {data.map((e, k) => (
        <span className={`bg s_${e}`} key={k} />
      ))}
    </div>
  );
}

export function Number({ number = 0, length = 6, time = false, dataTestId }: Props) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    if (!time) return;
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, [time]);

  if (time) {
    const hour = formate(now.getHours());
    const min = formate(now.getMinutes());
    const sec = now.getSeconds() % 2;
    const t = hour.concat(sec ? 'd' : 'd_c', min);
    return renderDigits(t, dataTestId);
  }

  const num = `${number}`.split('');
  for (let i = 0, len = length - num.length; i < len; i++) {
    num.unshift('n');
  }
  return renderDigits(num, dataTestId);
}
