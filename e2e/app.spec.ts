import { expect, test, type Locator, type Page } from '@playwright/test';

async function readDigitSignature(locator: Locator) {
  return locator
    .locator('span')
    .evaluateAll((nodes) => nodes.map((node) => node.className).join('|'));
}

async function readNumberValue(locator: Locator) {
  return locator.locator('span').evaluateAll((nodes) =>
    nodes
      .map((node) => {
        const match = node.className.match(/s_([a-z0-9_]+)/);
        if (!match) return '';
        const value = match[1];
        return value === 'n' ? '' : value.replace('_c', '');
      })
      .join(''),
  );
}

type Snapshot = {
  pause: boolean;
  music: boolean;
  startLines: number;
  speedStart: number;
  speedRun: number;
  clearLines: number;
  hasCur: boolean;
  curType: string | null;
  curXy: [number, number] | null;
  lockedCells: number;
  drop: boolean;
  reset: boolean;
  focus: boolean;
  points: number;
  max: number;
  next: string;
};

type ActionKey = 'left' | 'right' | 'down' | 'rotate' | 'space' | 'p' | 'r' | 's';

async function tapAction(page: Page, key: ActionKey) {
  await page.evaluate((todoKey) => window.tetrisE2E?.tap(todoKey), key);
}

async function keyDownAction(page: Page, key: ActionKey) {
  await page.evaluate((todoKey) => window.tetrisE2E?.keyDown(todoKey), key);
}

async function keyUpAction(page: Page, key: ActionKey) {
  await page.evaluate((todoKey) => window.tetrisE2E?.keyUp(todoKey), key);
}

async function resetGame(page: Page, record: Record<string, unknown> | null = null) {
  await page.evaluate((nextRecord) => window.tetrisE2E?.reset(nextRecord), record);
}

async function startGame(page: Page) {
  await page.evaluate(() => window.tetrisE2E?.start());
}

async function setFocus(page: Page, isFocus: boolean) {
  await page.evaluate((nextFocus) => window.tetrisE2E?.focus(nextFocus), isFocus);
}

async function clearLinesByHook(page: Page, matrix: number[][], lines: number[]) {
  await page.evaluate(
    ({ nextMatrix, nextLines }) => window.tetrisE2E?.clearLines(nextMatrix, nextLines),
    { nextMatrix: matrix, nextLines: lines },
  );
}

async function nextAroundByHook(page: Page, matrix: number[][]) {
  await page.evaluate((nextMatrix) => window.tetrisE2E?.nextAround(nextMatrix), matrix);
}

async function snapshot(page: Page) {
  return page.evaluate(() => window.tetrisE2E?.snapshot() as Snapshot);
}

async function activeCellCount(page: Page) {
  return page.locator('[data-testid="matrix"] b.c, [data-testid="matrix"] b.d').count();
}

async function waitForE2EHook(page: Page) {
  await expect.poll(() => page.evaluate(() => !!window.tetrisE2E)).toBe(true);
}

async function waitForIdleReady(page: Page) {
  await waitForE2EHook(page);
  await expect.poll(async () => (await snapshot(page)).reset).toBe(false);
}

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await expect(page.getByTestId('app')).toBeVisible();
  await expect(page.getByTestId('matrix')).toBeVisible();
  await waitForIdleReady(page);
});

test('待机态显示正确并允许调整起始配置', async ({ page }) => {
  await expect(page.getByText('起始行')).toBeVisible();
  await expect(page.getByText('级别')).toBeVisible();
  await expect(page.getByText('下一个')).toBeVisible();
  await expect(page.locator('[data-testid="next-piece"] b.c')).toHaveCount(4);

  const statusValue = page.getByTestId('status-value');
  const levelValue = page.getByTestId('level-value');
  const startLinesBefore = await readDigitSignature(statusValue);
  const levelBefore = await readDigitSignature(levelValue);
  const stateBefore = await snapshot(page);

  await tapAction(page, 'rotate');
  await tapAction(page, 'right');

  await expect.poll(() => readDigitSignature(statusValue)).not.toBe(startLinesBefore);
  await expect.poll(() => readDigitSignature(levelValue)).not.toBe(levelBefore);
  await expect.poll(async () => (await snapshot(page)).startLines).not.toBe(stateBefore.startLines);
  await expect.poll(async () => (await snapshot(page)).speedStart).not.toBe(stateBefore.speedStart);
});

test('页面按钮可开始游戏并支持暂停恢复与重开', async ({ page }) => {
  await tapAction(page, 'space');
  await expect(page.getByText('消除行')).toBeVisible();
  await expect.poll(async () => (await snapshot(page)).hasCur).toBe(true);
  await expect.poll(() => activeCellCount(page)).toBeGreaterThan(0);

  await tapAction(page, 'p');
  await expect.poll(async () => (await snapshot(page)).pause).toBe(true);

  await tapAction(page, 'p');
  await expect.poll(async () => (await snapshot(page)).pause).toBe(false);

  await tapAction(page, 'r');
  await expect(page.getByText('起始行')).toBeVisible({ timeout: 5000 });
  await expect.poll(async () => (await snapshot(page)).hasCur).toBe(false);
});

test('屏幕按钮可点击并支持音效开关', async ({ page }) => {
  const musicIndicator = page.getByTestId('music-indicator');
  const before = await snapshot(page);

  await tapAction(page, 's');
  await expect.poll(async () => (await snapshot(page)).music).toBe(!before.music);
  if (before.music) {
    await expect(musicIndicator).toHaveClass(/off/);
  } else {
    await expect(musicIndicator).not.toHaveClass(/off/);
  }

  await tapAction(page, 's');
  await expect.poll(async () => (await snapshot(page)).music).toBe(before.music);
  if (before.music) {
    await expect(musicIndicator).not.toHaveClass(/off/);
  } else {
    await expect(musicIndicator).toHaveClass(/off/);
  }

  await tapAction(page, 'space');
  await expect(page.getByText('消除行')).toBeVisible();

  await tapAction(page, 'p');
  await expect.poll(async () => (await snapshot(page)).pause).toBe(true);
});

test('进行中的游戏刷新后可以恢复状态', async ({ page }) => {
  await page.goto('/?lan=en');
  await waitForIdleReady(page);
  await expect(page.getByText('Start Line')).toBeVisible();

  await tapAction(page, 'space');
  await expect(page.getByText('Cleans')).toBeVisible();
  await expect.poll(async () => (await snapshot(page)).hasCur).toBe(true);
  await expect.poll(() => activeCellCount(page)).toBeGreaterThan(0);

  await page.reload();

  await expect(page.getByText('Cleans')).toBeVisible();
  await expect.poll(async () => (await snapshot(page)).hasCur).toBe(true);
  await expect.poll(() => activeCellCount(page)).toBeGreaterThan(0);
});

test('消行后更新分数、累计行数并在阈值处提速', async ({ page }) => {
  const filledRow = Array(10).fill(1);
  const matrix = Array.from({ length: 20 }, (_, index) =>
    index === 19 ? [...filledRow] : Array(10).fill(0),
  );

  await resetGame(page, {
    points: 10,
    next: 'L',
    speedStart: 1,
    speedRun: 1,
    clearLines: 19,
    lock: true,
    matrix,
  });

  const scoreBefore = await readDigitSignature(page.getByTestId('score-value'));
  const levelBefore = await readDigitSignature(page.getByTestId('level-value'));

  await clearLinesByHook(page, matrix, [19]);

  await expect.poll(async () => (await snapshot(page)).points).toBe(110);
  await expect.poll(async () => (await snapshot(page)).clearLines).toBe(20);
  await expect.poll(async () => (await snapshot(page)).speedRun).toBe(2);
  await expect.poll(async () => (await snapshot(page)).curType).toBe('L');
  await expect
    .poll(() => readDigitSignature(page.getByTestId('score-value')))
    .not.toBe(scoreBefore);
  await expect
    .poll(() => readDigitSignature(page.getByTestId('level-value')))
    .not.toBe(levelBefore);
});

test('长按待机态按键会连续调整配置，并在松开后停止', async ({ page }) => {
  const statusValue = page.getByTestId('status-value');
  const levelValue = page.getByTestId('level-value');

  await expect.poll(() => readNumberValue(statusValue)).toBe('0');
  await expect.poll(() => readNumberValue(levelValue)).toBe('1');

  await keyDownAction(page, 'rotate');
  await page.waitForTimeout(350);
  await keyUpAction(page, 'rotate');
  const startLinesAfterHold = await snapshot(page);
  expect(startLinesAfterHold.startLines).toBeGreaterThanOrEqual(2);

  const frozenStartLines = startLinesAfterHold.startLines;
  await page.waitForTimeout(250);
  expect((await snapshot(page)).startLines).toBe(frozenStartLines);

  await keyDownAction(page, 'right');
  await page.waitForTimeout(350);
  await keyUpAction(page, 'right');
  const speedAfterHold = await snapshot(page);
  expect(speedAfterHold.speedStart).toBeGreaterThanOrEqual(3);
});

test('游戏中长按左右与下键会连续移动，并在松开后停止连发', async ({ page }) => {
  await resetGame(page, {
    matrix: Array.from({ length: 20 }, () => Array(10).fill(0)),
    cur: {
      type: 'T',
      shape: [
        [0, 1, 0],
        [1, 1, 1],
      ],
      xy: [4, 4],
      rotateIndex: 0,
      timeStamp: 100,
    },
    speedStart: 6,
    speedRun: 6,
    pause: false,
    lock: false,
    reset: false,
  });

  const beforeLeft = await snapshot(page);
  await keyDownAction(page, 'left');
  await page.waitForTimeout(350);
  await keyUpAction(page, 'left');
  const afterLeft = await snapshot(page);
  expect(afterLeft.curXy?.[1] ?? 99).toBeLessThan(beforeLeft.curXy?.[1] ?? 99);

  const leftFrozenX = afterLeft.curXy?.[1] ?? 0;
  await page.waitForTimeout(220);
  expect((await snapshot(page)).curXy?.[1]).toBe(leftFrozenX);

  await keyDownAction(page, 'right');
  await page.waitForTimeout(350);
  await keyUpAction(page, 'right');
  const afterRight = await snapshot(page);
  expect(afterRight.curXy?.[1] ?? -99).toBeGreaterThan(leftFrozenX);

  const beforeDownY = afterRight.curXy?.[0] ?? 0;
  await keyDownAction(page, 'down');
  await page.waitForTimeout(180);
  await keyUpAction(page, 'down');
  const afterDown = await snapshot(page);
  expect(afterDown.curXy?.[0] ?? -1).toBeGreaterThan(beforeDownY);
});

test('顶部占用时触发 game over，并回到可重新开始状态', async ({ page }) => {
  const matrix = Array.from({ length: 20 }, (_row, rowIndex) =>
    Array.from({ length: 10 }, (_col, colIndex) => (rowIndex === 0 && colIndex === 0 ? 1 : 0)),
  );

  await resetGame(page, {
    matrix,
    cur: {
      type: 'T',
      shape: [
        [0, 1, 0],
        [1, 1, 1],
      ],
      xy: [0, 4],
      rotateIndex: 0,
      timeStamp: 123,
    },
    reset: false,
    lock: false,
  });

  await nextAroundByHook(page, matrix);

  await expect.poll(async () => (await snapshot(page)).reset).toBe(true);
  await expect.poll(async () => (await snapshot(page)).hasCur).toBe(true);
  await expect.poll(async () => (await snapshot(page)).reset, { timeout: 5000 }).toBe(false);
  await expect.poll(async () => (await snapshot(page)).hasCur).toBe(false);

  await tapAction(page, 'space');
  await expect.poll(async () => (await snapshot(page)).hasCur).toBe(true);
  await expect(page.getByText('消除行')).toBeVisible();
});

test('硬降会短暂设置 drop 标记并快速锁定当前方块', async ({ page }) => {
  await resetGame(page, {
    speedStart: 2,
    speedRun: 2,
    next: 'I',
    startLines: 0,
  });
  await startGame(page);

  await expect.poll(async () => (await snapshot(page)).hasCur).toBe(true);
  const before = await snapshot(page);

  await tapAction(page, 'space');

  await expect.poll(async () => (await snapshot(page)).drop).toBe(true);
  await expect
    .poll(async () => (await snapshot(page)).lockedCells)
    .toBeGreaterThan(before.lockedCells);
  await expect.poll(async () => (await snapshot(page)).drop, { timeout: 1000 }).toBe(false);
});

test('暂停后不会自动推进，恢复后继续下落', async ({ page }) => {
  await resetGame(page, {
    matrix: Array.from({ length: 20 }, () => Array(10).fill(0)),
    cur: {
      type: 'I',
      shape: [[1, 1, 1, 1]],
      xy: [2, 3],
      rotateIndex: 0,
      timeStamp: 100,
    },
    speedStart: 6,
    speedRun: 6,
    pause: false,
    lock: false,
    reset: false,
  });
  await startGame(page);
  await expect.poll(async () => (await snapshot(page)).hasCur).toBe(true);

  await tapAction(page, 'p');
  await expect.poll(async () => (await snapshot(page)).pause).toBe(true);

  const pausedRow = (await snapshot(page)).curXy?.[0] ?? -1;
  await page.waitForTimeout(500);
  expect((await snapshot(page)).curXy?.[0]).toBe(pausedRow);

  await tapAction(page, 'p');
  await expect.poll(async () => (await snapshot(page)).pause).toBe(false);
  await expect
    .poll(async () => (await snapshot(page)).curXy?.[0] ?? -1, { timeout: 2000 })
    .toBeGreaterThan(pausedRow);
});

test('失焦时停止推进，恢复焦点后继续自动下落', async ({ page }) => {
  await resetGame(page, {
    speedStart: 6,
    speedRun: 6,
    startLines: 0,
    next: 'I',
  });
  await startGame(page);

  await expect.poll(async () => (await snapshot(page)).hasCur).toBe(true);
  const started = await snapshot(page);
  expect(started.curXy).not.toBeNull();

  await setFocus(page, false);
  const rowBeforeBlur = (await snapshot(page)).curXy?.[0] ?? -1;
  await page.waitForTimeout(500);
  const rowDuringBlur = (await snapshot(page)).curXy?.[0] ?? -1;
  expect(rowDuringBlur).toBe(rowBeforeBlur);

  await setFocus(page, true);
  await expect.poll(async () => (await snapshot(page)).focus).toBe(true);
  await expect
    .poll(async () => (await snapshot(page)).curXy?.[0] ?? -1, { timeout: 2000 })
    .toBeGreaterThan(rowDuringBlur);
});

test('暂停态刷新后保持暂停且恢复后可继续游戏', async ({ page }) => {
  await resetGame(page, {
    matrix: Array.from({ length: 20 }, () => Array(10).fill(0)),
    cur: {
      type: 'L',
      shape: [
        [0, 0, 1],
        [1, 1, 1],
      ],
      xy: [3, 4],
      rotateIndex: 0,
      timeStamp: 100,
    },
    pause: true,
    speedStart: 5,
    speedRun: 5,
    reset: false,
    lock: false,
  });

  await page.reload();
  await waitForE2EHook(page);
  await expect.poll(async () => (await snapshot(page)).pause).toBe(true);
  const pausedRow = (await snapshot(page)).curXy?.[0] ?? -1;
  await page.waitForTimeout(500);
  expect((await snapshot(page)).curXy?.[0]).toBe(pausedRow);

  await tapAction(page, 'p');
  await expect.poll(async () => (await snapshot(page)).pause).toBe(false);
  await expect
    .poll(async () => (await snapshot(page)).curXy?.[0] ?? -1, { timeout: 2000 })
    .toBeGreaterThan(pausedRow);
});

test('最高分与起始配置刷新后可以恢复', async ({ page }) => {
  await resetGame(page, {
    cur: null,
    points: 0,
    max: 4321,
    startLines: 5,
    speedStart: 4,
    speedRun: 4,
    pause: false,
    reset: false,
    lock: false,
  });

  await expect(page.getByText('最高分')).toBeVisible();
  await expect.poll(() => readNumberValue(page.getByTestId('score-value'))).toBe('4321');
  await expect.poll(() => readNumberValue(page.getByTestId('status-value'))).toBe('5');
  await expect.poll(() => readNumberValue(page.getByTestId('level-value'))).toBe('4');

  const stored = await page.evaluate(() => window.localStorage.getItem('REACT_TETRIS'));
  expect(stored).toBeTruthy();

  await page.reload();
  await waitForIdleReady(page);

  await expect.poll(async () => (await snapshot(page)).max).toBe(4321);
  await expect.poll(async () => (await snapshot(page)).startLines).toBe(5);
  await expect.poll(async () => (await snapshot(page)).speedStart).toBe(4);
  await expect(page.getByText('最高分')).toBeVisible();
  await expect.poll(() => readNumberValue(page.getByTestId('score-value'))).toBe('4321');
});

test('临近 game over 的进行中状态刷新后无异常且仍可操作', async ({ page }) => {
  const matrix = Array.from({ length: 20 }, (_row, rowIndex) =>
    Array.from({ length: 10 }, (_col, colIndex) => (rowIndex === 1 && colIndex < 9 ? 1 : 0)),
  );

  await resetGame(page, {
    matrix,
    cur: {
      type: 'O',
      shape: [
        [1, 1],
        [1, 1],
      ],
      xy: [-1, 8],
      rotateIndex: 0,
      timeStamp: 100,
    },
    next: 'I',
    pause: true,
    reset: false,
    lock: false,
    speedStart: 6,
    speedRun: 6,
  });

  await page.reload();
  await waitForE2EHook(page);
  await expect.poll(async () => (await snapshot(page)).hasCur).toBe(true);
  await expect.poll(async () => (await snapshot(page)).pause).toBe(true);
  await expect(page.getByText('消除行')).toBeVisible();

  const beforeMove = await snapshot(page);
  await tapAction(page, 'p');
  await expect.poll(async () => (await snapshot(page)).pause).toBe(false);

  await tapAction(page, 'left');
  await expect
    .poll(async () => (await snapshot(page)).curXy?.[1] ?? 99)
    .toBeLessThan(beforeMove.curXy?.[1] ?? 99);
});

test.describe('多语言基础文案', () => {
  test.describe.configure({ mode: 'parallel' });

  const cases = [
    { lan: 'cn', title: '俄罗斯方块', label: '起始行' },
    { lan: 'en', title: 'T E T R I S', label: 'Start Line' },
    { lan: 'fr', title: 'T E T R I S', label: 'Ligne Départ' },
    { lan: 'fa', title: 'خانه سازی', label: 'خط شروع' },
  ] as const;

  for (const { lan, title, label } of cases) {
    test(`?lan=${lan} 加载对应文案`, async ({ page }) => {
      await page.goto(`/?lan=${lan}`);
      await waitForIdleReady(page);
      await expect(page).toHaveTitle(title);
      await expect(page.getByText(label)).toBeVisible();
    });
  }
});
