import type { HTMLAttributes } from 'react';

type Props = {
  color: 'blue' | 'green' | 'red';
  size: 's0' | 's1' | 's2';
  top: number;
  left: number;
  label: string;
  dataTestId?: string;
  arrow?: string;
  position?: boolean;
  active: boolean;
} & Pick<
  HTMLAttributes<HTMLDivElement>,
  'onMouseDown' | 'onMouseUp' | 'onMouseLeave' | 'onTouchStart' | 'onTouchEnd'
>;

export function Button({
  color,
  size,
  top,
  left,
  label,
  dataTestId,
  arrow,
  position,
  active,
  onMouseDown,
  onMouseUp,
  onMouseLeave,
  onTouchStart,
  onTouchEnd,
}: Props) {
  return (
    <div
      className={`button ${color} ${size}`}
      data-testid={dataTestId}
      onMouseDown={onMouseDown}
      onMouseLeave={onMouseLeave}
      onMouseUp={onMouseUp}
      onTouchEnd={onTouchEnd}
      onTouchStart={onTouchStart}
      style={{ top, left }}
    >
      <i className={active ? 'active' : ''}>
        {size === 's1' ? <em style={{ transform: arrow }} /> : null}
      </i>
      {position ? <span className="position">{label}</span> : <span>{label}</span>}
    </div>
  );
}
