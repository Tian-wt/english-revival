/**
 * HomeScreen 核心逻辑测试
 * 测试任务完成度、进度计算、导航映射、周打卡逻辑
 */
import { dailyTasks, userProgress } from '../src/data/mockData';

// ─── 从 HomeScreen 提取的纯逻辑（镜像实现）──────────────────────

/** 计算已完成任务数 */
function calcCompletedCount(tasks: typeof dailyTasks): number {
  return tasks.filter(t => t.completed).length;
}

/** 计算总分钟数 */
function calcTotalMinutes(tasks: typeof dailyTasks): number {
  return tasks.reduce((sum, t) => sum + t.duration, 0);
}

/** 计算已完成分钟数 */
function calcCompletedMinutes(tasks: typeof dailyTasks): number {
  return tasks.filter(t => t.completed).reduce((sum, t) => sum + t.duration, 0);
}

/** 计算进度百分比 */
function calcProgressPct(completedMinutes: number, totalMinutes: number): number {
  if (totalMinutes === 0) return 0;
  return (completedMinutes / totalMinutes) * 100;
}

/** 切换任务完成状态 */
function toggleTask(tasks: typeof dailyTasks, id: string): typeof dailyTasks {
  return tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t);
}

/** 任务类型到导航目标的映射 */
function getNavigationTarget(type: string): string | null {
  if (type === 'listening') return 'Listening';
  if (type === 'speaking') return 'Speaking';
  if (type === 'pronunciation') return 'Pronunciation';
  return null;
}

/** 周打卡点状态 */
function getDayDotState(dayIndex: number, weeklyCompleted: number): 'filled' | 'today' | 'empty' {
  if (dayIndex < weeklyCompleted) return 'filled';
  if (dayIndex === weeklyCompleted) return 'today';
  return 'empty';
}

// ─── 任务完成度计算 ──────────────────────────────────────────────
describe('任务完成度计算', () => {
  test('初始数据：1 个任务已完成', () => {
    expect(calcCompletedCount(dailyTasks)).toBe(1);
  });

  test('全部完成后 completedCount = tasks.length', () => {
    const allDone = dailyTasks.map(t => ({ ...t, completed: true }));
    expect(calcCompletedCount(allDone)).toBe(dailyTasks.length);
  });

  test('全部未完成后 completedCount = 0', () => {
    const allPending = dailyTasks.map(t => ({ ...t, completed: false }));
    expect(calcCompletedCount(allPending)).toBe(0);
  });

  test('completedCount 不超过 tasks.length', () => {
    expect(calcCompletedCount(dailyTasks)).toBeLessThanOrEqual(dailyTasks.length);
  });
});

// ─── 分钟数计算 ──────────────────────────────────────────────────
describe('分钟数计算', () => {
  test('totalMinutes 等于所有任务时长之和', () => {
    const expected = dailyTasks.reduce((sum, t) => sum + t.duration, 0);
    expect(calcTotalMinutes(dailyTasks)).toBe(expected);
  });

  test('completedMinutes 只计算已完成任务', () => {
    const completedTasks = dailyTasks.filter(t => t.completed);
    const expected = completedTasks.reduce((sum, t) => sum + t.duration, 0);
    expect(calcCompletedMinutes(dailyTasks)).toBe(expected);
  });

  test('completedMinutes <= totalMinutes', () => {
    expect(calcCompletedMinutes(dailyTasks)).toBeLessThanOrEqual(calcTotalMinutes(dailyTasks));
  });

  test('全部完成时 completedMinutes = totalMinutes', () => {
    const allDone = dailyTasks.map(t => ({ ...t, completed: true }));
    expect(calcCompletedMinutes(allDone)).toBe(calcTotalMinutes(allDone));
  });
});

// ─── 进度百分比 ──────────────────────────────────────────────────
describe('calcProgressPct - 进度百分比', () => {
  test('0/15 → 0%', () => expect(calcProgressPct(0, 15)).toBe(0));
  test('15/15 → 100%', () => expect(calcProgressPct(15, 15)).toBe(100));
  test('5/15 → 33.33%', () => expect(calcProgressPct(5, 15)).toBeCloseTo(33.33, 1));
  test('totalMinutes=0 时不除以零 → 0', () => expect(calcProgressPct(0, 0)).toBe(0));

  test('真实数据进度百分比在 [0, 100] 范围内', () => {
    const total = calcTotalMinutes(dailyTasks);
    const completed = calcCompletedMinutes(dailyTasks);
    const pct = calcProgressPct(completed, total);
    expect(pct).toBeGreaterThanOrEqual(0);
    expect(pct).toBeLessThanOrEqual(100);
  });
});

// ─── toggleTask ──────────────────────────────────────────────────
describe('toggleTask - 切换任务状态', () => {
  test('切换已完成任务 → 变为未完成', () => {
    const completedTask = dailyTasks.find(t => t.completed);
    if (!completedTask) return;
    const result = toggleTask(dailyTasks, completedTask.id);
    const toggled = result.find(t => t.id === completedTask.id);
    expect(toggled?.completed).toBe(false);
  });

  test('切换未完成任务 → 变为已完成', () => {
    const pendingTask = dailyTasks.find(t => !t.completed);
    if (!pendingTask) return;
    const result = toggleTask(dailyTasks, pendingTask.id);
    const toggled = result.find(t => t.id === pendingTask.id);
    expect(toggled?.completed).toBe(true);
  });

  test('切换不影响其他任务', () => {
    const targetId = dailyTasks[0].id;
    const result = toggleTask(dailyTasks, targetId);
    result.forEach(t => {
      if (t.id !== targetId) {
        const original = dailyTasks.find(o => o.id === t.id);
        expect(t.completed).toBe(original?.completed);
      }
    });
  });

  test('不存在的 id 不改变任何任务', () => {
    const result = toggleTask(dailyTasks, 'nonexistent');
    result.forEach((t, i) => {
      expect(t.completed).toBe(dailyTasks[i].completed);
    });
  });

  test('连续切换两次恢复原状', () => {
    const id = dailyTasks[0].id;
    const original = dailyTasks[0].completed;
    const once = toggleTask(dailyTasks, id);
    const twice = toggleTask(once, id);
    expect(twice.find(t => t.id === id)?.completed).toBe(original);
  });
});

// ─── 导航映射 ────────────────────────────────────────────────────
describe('getNavigationTarget - 任务类型导航映射', () => {
  test('listening → Listening', () => expect(getNavigationTarget('listening')).toBe('Listening'));
  test('speaking → Speaking', () => expect(getNavigationTarget('speaking')).toBe('Speaking'));
  test('pronunciation → Pronunciation', () => expect(getNavigationTarget('pronunciation')).toBe('Pronunciation'));
  test('未知类型 → null', () => expect(getNavigationTarget('vocabulary')).toBeNull());

  test('所有 dailyTasks 的 type 都有对应导航目标', () => {
    dailyTasks.forEach(t => {
      expect(getNavigationTarget(t.type)).not.toBeNull();
    });
  });
});

// ─── 周打卡点状态 ────────────────────────────────────────────────
describe('getDayDotState - 周打卡状态', () => {
  const weeklyCompleted = userProgress.weeklyCompleted; // 4

  test('已完成的天 → filled', () => {
    for (let i = 0; i < weeklyCompleted; i++) {
      expect(getDayDotState(i, weeklyCompleted)).toBe('filled');
    }
  });

  test('今天（weeklyCompleted 索引）→ today', () => {
    expect(getDayDotState(weeklyCompleted, weeklyCompleted)).toBe('today');
  });

  test('未来的天 → empty', () => {
    for (let i = weeklyCompleted + 1; i < 7; i++) {
      expect(getDayDotState(i, weeklyCompleted)).toBe('empty');
    }
  });

  test('weeklyCompleted=0 时第 0 天是 today', () => {
    expect(getDayDotState(0, 0)).toBe('today');
  });

  test('weeklyCompleted=7 时所有天都是 filled', () => {
    for (let i = 0; i < 7; i++) {
      expect(getDayDotState(i, 7)).toBe('filled');
    }
  });
});

// ─── 用户进度数据展示 ────────────────────────────────────────────
describe('用户进度数据展示', () => {
  test('streak 显示正确', () => {
    expect(userProgress.streak).toBe(7);
  });

  test('四维分数都在合理范围', () => {
    const { listeningScore, speakingScore, pronunciationScore, vocabularyScore } = userProgress.stats;
    [listeningScore, speakingScore, pronunciationScore, vocabularyScore].forEach(s => {
      expect(s).toBeGreaterThan(0);
      expect(s).toBeLessThanOrEqual(100);
    });
  });

  test('进度条宽度百分比不超过 100%', () => {
    const { listeningScore, speakingScore, pronunciationScore, vocabularyScore } = userProgress.stats;
    [listeningScore, speakingScore, pronunciationScore, vocabularyScore].forEach(s => {
      expect(`${s}%`).toMatch(/^\d+%$/);
      expect(s).toBeLessThanOrEqual(100);
    });
  });
});
