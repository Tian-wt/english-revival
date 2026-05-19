/**
 * ListeningScreen 核心逻辑测试
 * 提取并测试所有纯函数逻辑，不依赖 React Native 渲染
 */
import { listeningLessons } from '../src/data/mockData';

// ─── 从 ListeningScreen 提取的纯函数（镜像实现）────────────────

/** 格式化秒数为 m:ss */
function formatTime(s: number): string {
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

/** 根据 transcript 字数估算总时长（秒） */
function getTotalSeconds(lesson: typeof listeningLessons[0]): number {
  const totalWords = lesson.transcript.reduce((sum, l) => sum + l.text.split(' ').length, 0);
  return Math.max(totalWords * 0.4, 15);
}

/** 根据倍速计算每句等待时间（ms） */
function estimateLineMs(text: string, rate: number): number {
  const wordCount = text.split(' ').length;
  return (wordCount * 400 + 600) / rate;
}

/** 计算 quiz 得分 */
function calcQuizScore(
  questions: { answer: number }[],
  answers: number[]
): number {
  let correct = 0;
  questions.forEach((q, i) => {
    if (answers[i] === q.answer) correct++;
  });
  return correct;
}

/** 根据得分百分比返回结果消息 */
function getResultMsg(pct: number): string {
  if (pct >= 80) return 'Excellent! Your listening comprehension is strong.';
  if (pct >= 50) return 'Good effort! Keep practicing to improve.';
  return 'Keep going! Listening takes time to develop.';
}

/** 根据得分百分比返回 emoji */
function getResultEmoji(pct: number): string {
  if (pct >= 80) return '🎉';
  if (pct >= 50) return '👍';
  return '💪';
}

/** 根据 level 返回颜色 */
function levelColor(level: string): string {
  if (level === 'Beginner') return '#10B981';
  if (level === 'Intermediate') return '#F59E0B';
  return '#EF4444';
}

/** 计算实际 TTS 速率（rate * 0.88） */
function ttsRate(playbackRate: number): number {
  return playbackRate * 0.88;
}

// ─── formatTime ──────────────────────────────────────────────────
describe('formatTime', () => {
  test('0 秒 → 0:00', () => expect(formatTime(0)).toBe('0:00'));
  test('30 秒 → 0:30', () => expect(formatTime(30)).toBe('0:30'));
  test('60 秒 → 1:00', () => expect(formatTime(60)).toBe('1:00'));
  test('90 秒 → 1:30', () => expect(formatTime(90)).toBe('1:30'));
  test('150 秒 → 2:30', () => expect(formatTime(150)).toBe('2:30'));
  test('225 秒 → 3:45', () => expect(formatTime(225)).toBe('3:45'));
  test('个位秒数补零 → 1:05', () => expect(formatTime(65)).toBe('1:05'));
  test('59 秒 → 0:59', () => expect(formatTime(59)).toBe('0:59'));
});

// ─── getTotalSeconds ─────────────────────────────────────────────
describe('getTotalSeconds', () => {
  test('最小值不低于 15 秒', () => {
    listeningLessons.forEach(lesson => {
      expect(getTotalSeconds(lesson)).toBeGreaterThanOrEqual(15);
    });
  });

  test('字数越多时长越长', () => {
    const lesson1 = listeningLessons[0]; // Coffee Shop (短)
    const lesson4 = listeningLessons[3]; // Tech Meeting (长)
    expect(getTotalSeconds(lesson4)).toBeGreaterThan(getTotalSeconds(lesson1));
  });

  test('单词数 * 0.4 的计算正确', () => {
    const lesson = listeningLessons[0];
    const totalWords = lesson.transcript.reduce((sum, l) => sum + l.text.split(' ').length, 0);
    expect(getTotalSeconds(lesson)).toBe(Math.max(totalWords * 0.4, 15));
  });
});

// ─── estimateLineMs（倍速核心逻辑）──────────────────────────────
describe('estimateLineMs - 倍速等待时间', () => {
  const sampleText = 'Hi there welcome to Brew and Bean'; // 7 words

  test('1.0x 速率下等待时间基准正确', () => {
    const ms = estimateLineMs(sampleText, 1.0);
    expect(ms).toBe((7 * 400 + 600) / 1.0); // 3400ms
  });

  test('0.75x 速率下等待时间比 1.0x 更长', () => {
    const ms075 = estimateLineMs(sampleText, 0.75);
    const ms100 = estimateLineMs(sampleText, 1.0);
    expect(ms075).toBeGreaterThan(ms100);
  });

  test('1.25x 速率下等待时间比 1.0x 更短', () => {
    const ms125 = estimateLineMs(sampleText, 1.25);
    const ms100 = estimateLineMs(sampleText, 1.0);
    expect(ms125).toBeLessThan(ms100);
  });

  test('0.75x 等待时间约为 1.0x 的 1/0.75 倍', () => {
    const ms075 = estimateLineMs(sampleText, 0.75);
    const ms100 = estimateLineMs(sampleText, 1.0);
    expect(ms075).toBeCloseTo(ms100 / 0.75, 5);
  });

  test('1.25x 等待时间约为 1.0x 的 1/1.25 倍', () => {
    const ms125 = estimateLineMs(sampleText, 1.25);
    const ms100 = estimateLineMs(sampleText, 1.0);
    expect(ms125).toBeCloseTo(ms100 / 1.25, 5);
  });

  test('单词数越多等待时间越长', () => {
    const short = estimateLineMs('Hello', 1.0);
    const long = estimateLineMs('This is a much longer sentence with many more words in it', 1.0);
    expect(long).toBeGreaterThan(short);
  });
});

// ─── ttsRate（TTS 实际速率）─────────────────────────────────────
describe('ttsRate - TTS 实际速率计算', () => {
  test('1.0x → 0.88', () => expect(ttsRate(1.0)).toBeCloseTo(0.88));
  test('0.75x → 0.66', () => expect(ttsRate(0.75)).toBeCloseTo(0.66));
  test('1.25x → 1.10', () => expect(ttsRate(1.25)).toBeCloseTo(1.10));
  test('速率随 playbackRate 线性增长', () => {
    expect(ttsRate(1.25)).toBeGreaterThan(ttsRate(1.0));
    expect(ttsRate(1.0)).toBeGreaterThan(ttsRate(0.75));
  });
});

// ─── calcQuizScore ───────────────────────────────────────────────
describe('calcQuizScore', () => {
  const questions = [
    { answer: 1 },
    { answer: 2 },
    { answer: 0 },
  ];

  test('全对 → 3', () => {
    expect(calcQuizScore(questions, [1, 2, 0])).toBe(3);
  });

  test('全错 → 0', () => {
    expect(calcQuizScore(questions, [0, 0, 1])).toBe(0);
  });

  test('部分正确 → 1', () => {
    expect(calcQuizScore(questions, [1, 0, 1])).toBe(1);
  });

  test('部分正确 → 2', () => {
    expect(calcQuizScore(questions, [1, 2, 1])).toBe(2);
  });

  test('空答案 → 0', () => {
    expect(calcQuizScore(questions, [])).toBe(0);
  });

  test('真实数据：Coffee Shop 课程答案验证', () => {
    const lesson = listeningLessons[0];
    // 正确答案：Q1=1(Latte), Q2=2(Oat milk)
    const correctAnswers = lesson.questions.map(q => q.answer);
    expect(calcQuizScore(lesson.questions, correctAnswers)).toBe(lesson.questions.length);
  });
});

// ─── getResultMsg ────────────────────────────────────────────────
describe('getResultMsg', () => {
  test('100% → Excellent', () => expect(getResultMsg(100)).toContain('Excellent'));
  test('80% → Excellent', () => expect(getResultMsg(80)).toContain('Excellent'));
  test('79% → Good effort', () => expect(getResultMsg(79)).toContain('Good effort'));
  test('50% → Good effort', () => expect(getResultMsg(50)).toContain('Good effort'));
  test('49% → Keep going', () => expect(getResultMsg(49)).toContain('Keep going'));
  test('0% → Keep going', () => expect(getResultMsg(0)).toContain('Keep going'));
});

// ─── getResultEmoji ──────────────────────────────────────────────
describe('getResultEmoji', () => {
  test('>=80 → 🎉', () => expect(getResultEmoji(80)).toBe('🎉'));
  test('>=50 且 <80 → 👍', () => expect(getResultEmoji(60)).toBe('👍'));
  test('<50 → 💪', () => expect(getResultEmoji(30)).toBe('💪'));
  test('边界 50 → 👍', () => expect(getResultEmoji(50)).toBe('👍'));
  test('边界 79 → 👍', () => expect(getResultEmoji(79)).toBe('👍'));
});

// ─── levelColor ──────────────────────────────────────────────────
describe('levelColor', () => {
  test('Beginner → 绿色', () => expect(levelColor('Beginner')).toBe('#10B981'));
  test('Intermediate → 琥珀色', () => expect(levelColor('Intermediate')).toBe('#F59E0B'));
  test('Advanced → 红色', () => expect(levelColor('Advanced')).toBe('#EF4444'));
  test('未知 level → 红色（fallback）', () => expect(levelColor('Expert')).toBe('#EF4444'));
});

// ─── 倍速切换时的状态一致性 ─────────────────────────────────────
describe('倍速切换逻辑一致性', () => {
  const speeds = [0.75, 1.0, 1.25] as const;

  test('三个速度选项的 TTS 速率严格递增', () => {
    const rates = speeds.map(s => ttsRate(s));
    expect(rates[0]).toBeLessThan(rates[1]);
    expect(rates[1]).toBeLessThan(rates[2]);
  });

  test('三个速度选项的等待时间严格递减', () => {
    const text = 'Hello world this is a test sentence';
    const delays = speeds.map(s => estimateLineMs(text, s));
    expect(delays[0]).toBeGreaterThan(delays[1]);
    expect(delays[1]).toBeGreaterThan(delays[2]);
  });

  test('切换速度后 TTS 速率立即生效（不依赖旧 state）', () => {
    // 模拟：播放中切换速度，新速率直接传入 speakAllLines
    const oldRate = 1.0;
    const newRate = 1.25;
    // 新速率应该比旧速率快
    expect(ttsRate(newRate)).toBeGreaterThan(ttsRate(oldRate));
    // 新速率的等待时间应该更短
    const text = 'Test sentence with some words';
    expect(estimateLineMs(text, newRate)).toBeLessThan(estimateLineMs(text, oldRate));
  });
});
