import { clearPoints, eachLines, maxPoint } from './const';

export function clampPoints(point: number): number {
  if (point < 0) return 0;
  if (point > maxPoint) return maxPoint;
  return point;
}

export function placementPoints(current: number, speedRun: number): number {
  return clampPoints(current + 10 + (speedRun - 1) * 2);
}

export function clearLinePoints(current: number, lineCount: number): number {
  if (lineCount < 1 || lineCount > 4) return clampPoints(current);
  return clampPoints(current + clearPoints[lineCount - 1]);
}

export function nextSpeedRun(speedStart: number, clearLines: number): number {
  const speedAdd = Math.floor(clearLines / eachLines);
  const speedNow = speedStart + speedAdd;
  return speedNow > 6 ? 6 : speedNow;
}
