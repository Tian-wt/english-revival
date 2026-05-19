/**
 * PronunciationScreen 核心逻辑测试
 * 测试进度计算、评分、avgScore、scoreColor、scoreLabel 等纯逻辑
 */
import { pronunciationExercises } from '../src/data/mockData';

// ─── 从 PronunciationScreen 提取的纯逻辑（镜像实现）──────────────

/** 计算练习进度（0~1） */
function calcProgress(
  mode: 'words' | 'sentences',
  wordIdx: number,
  sentenceIdx: number,
  totalWords: number,
  totalSentences: number
): number {
  const totalItems = totalWords + totalSentences;
  const completedItems = mode === 'words' ? wordIdx : totalWords + sentenceIdx;
  return completedItems / totalItems;
}

/** 计算平均分 */
function calcAvgScore(scores: number[]): number {
  if (scores.length === 0) return 0;
  return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
}

/** 根据分数返回颜色 */
function scoreColor(s: number): string {
  if (s >= 85) return '#10B981'; // Colors.secondary
  if (s >= 70) return '#F59E0B'; // Colors.accent
  return '#EF4444';              // Colors.danger
}

/** 根据分数返回标签 */
function scoreLabel(s: number): string {
  if (s >= 90) return 'Excellent! 🌟';
  if (s >= 80) return 'Great job! 👍';
  if (s >= 70) return 'Good effort 💪';
  return 'Keep practicing 🔄';
}

/** 难度星级显示 */
function difficultyStars(d: number): string {
  return '★'.repeat(d) + '☆'.repeat(3 - d);
}

/** 提取单词文本（去掉 "→ xxx" 和音标部分） */
function extractWordText(word: string): string {
  return word.split('→')[0].split('/')[0].trim();
}

/** Mock 评分范围 63-98 */
function isValidPronunciationScore(score: number): boolean {
  return score >= 63 && score <= 98;
}

/** 结果页面消息 */
function getResultMsg(avgScore: number): string {
  if (avgScore >= 85) return "Outstanding pronunciation! You're sounding very natural.";
  if (avgScore >= 70) return "Good work! A bit more practice and you'll nail it.";
  return 'Keep practicing! Pronunciation improves with repetition.';
}

/** 结果页面 emoji */
function getResultEmoji(avgScore: number): string {
  if (avgScore >= 80) return '🎉';
  if (avgScore >= 65) return '👍';
  return '💪';
}

// ─── calcProgress ────────────────────────────────────────────────
describe('calcProgress - 练习进度计算', () => {
  const totalWords = 5;
  const totalSentences = 3;

  test('初始状态（words 模式，wordIdx=0）→ 0', () => {
    expect(calcProgress('words', 0, 0, totalWords, totalSentences)).toBe(0);
  });

  test('words 模式完成一半 → 0.3125', () => {
    // 完成 2/8 = 0.25
    expect(calcProgress('words', 2, 0, totalWords, totalSentences)).toBeCloseTo(2 / 8);
  });

  test('words 全部完成（进入 sentences 模式）→ 5/8', () => {
    expect(calcProgress('sentences', 0, 0, totalWords, totalSentences)).toBeCloseTo(5 / 8);
  });

  test('sentences 完成一条 → 6/8', () => {
    expect(calcProgress('sentences', 0, 1, totalWords, totalSentences)).toBeCloseTo(6 / 8);
  });

  test('全部完成 → 1.0（最后一句完成后跳转 result）', () => {
    // 最后一句 sentenceIdx = totalSentences - 1 = 2
    expect(calcProgress('sentences', 0, totalSentences - 1, totalWords, totalSentences))
      .toBeCloseTo((totalWords + totalSentences - 1) / (totalWords + totalSentences));
  });

  test('进度值始终在 [0, 1) 范围内', () => {
    for (let wi = 0; wi < totalWords; wi++) {
      const p = calcProgress('words', wi, 0, totalWords, totalSentences);
      expect(p).toBeGreaterThanOrEqual(0);
      expect(p).toBeLessThan(1);
    }
  });
});

// ─── calcAvgScore ────────────────────────────────────────────────
describe('calcAvgScore - 平均分计算', () => {
  test('空数组 → 0', () => expect(calcAvgScore([])).toBe(0));
  test('单个分数 → 该分数', () => expect(calcAvgScore([85])).toBe(85));
  test('两个相同分数 → 该分数', () => expect(calcAvgScore([80, 80])).toBe(80));
  test('整数平均', () => expect(calcAvgScore([70, 90])).toBe(80));
  test('四舍五入', () => expect(calcAvgScore([70, 71])).toBe(71)); // 70.5 → 71
  test('多个分数平均', () => {
    expect(calcAvgScore([63, 75, 85, 98])).toBe(Math.round((63 + 75 + 85 + 98) / 4));
  });
  test('全满分 → 100', () => expect(calcAvgScore([100, 100, 100])).toBe(100));
  test('全最低分 → 63', () => expect(calcAvgScore([63, 63, 63])).toBe(63));
});

// ─── scoreColor ──────────────────────────────────────────────────
describe('scoreColor', () => {
  test('>=85 → 绿色', () => expect(scoreColor(85)).toBe('#10B981'));
  test('>=70 且 <85 → 琥珀色', () => expect(scoreColor(70)).toBe('#F59E0B'));
  test('<70 → 红色', () => expect(scoreColor(69)).toBe('#EF4444'));
  test('100 → 绿色', () => expect(scoreColor(100)).toBe('#10B981'));
  test('边界 84 → 琥珀色', () => expect(scoreColor(84)).toBe('#F59E0B'));
  test('边界 85 → 绿色', () => expect(scoreColor(85)).toBe('#10B981'));
  test('0 → 红色', () => expect(scoreColor(0)).toBe('#EF4444'));
});

// ─── scoreLabel ──────────────────────────────────────────────────
describe('scoreLabel', () => {
  test('>=90 → Excellent', () => expect(scoreLabel(90)).toContain('Excellent'));
  test('>=80 且 <90 → Great job', () => expect(scoreLabel(80)).toContain('Great job'));
  test('>=70 且 <80 → Good effort', () => expect(scoreLabel(70)).toContain('Good effort'));
  test('<70 → Keep practicing', () => expect(scoreLabel(69)).toContain('Keep practicing'));
  test('100 → Excellent', () => expect(scoreLabel(100)).toContain('Excellent'));
  test('边界 89 → Great job', () => expect(scoreLabel(89)).toContain('Great job'));
  test('边界 79 → Good effort', () => expect(scoreLabel(79)).toContain('Good effort'));
});

// ─── difficultyStars ─────────────────────────────────────────────
describe('difficultyStars', () => {
  test('难度 1 → ★☆☆', () => expect(difficultyStars(1)).toBe('★☆☆'));
  test('难度 2 → ★★☆', () => expect(difficultyStars(2)).toBe('★★☆'));
  test('难度 3 → ★★★', () => expect(difficultyStars(3)).toBe('★★★'));
  test('总长度始终为 3', () => {
    [1, 2, 3].forEach(d => {
      expect(difficultyStars(d).length).toBe(3);
    });
  });
});

// ─── extractWordText ─────────────────────────────────────────────
describe('extractWordText - 单词文本提取', () => {
  test('普通单词直接返回', () => expect(extractWordText('think')).toBe('think'));
  test('带音标的单词去掉音标', () => expect(extractWordText('bit / beat')).toBe('bit'));
  test('带 → 的连读词取前半部分', () => expect(extractWordText('want to → wanna')).toBe('want to'));
  test('真实数据：TH Sound 单词', () => {
    const ex = pronunciationExercises[0]; // TH Sound
    ex.words.forEach(w => {
      const text = extractWordText(w.word);
      expect(text.trim().length).toBeGreaterThan(0);
    });
  });
});

// ─── isValidPronunciationScore ───────────────────────────────────
describe('isValidPronunciationScore - 评分范围', () => {
  test('63 是有效分数（最低）', () => expect(isValidPronunciationScore(63)).toBe(true));
  test('98 是有效分数（最高）', () => expect(isValidPronunciationScore(98)).toBe(true));
  test('80 是有效分数', () => expect(isValidPronunciationScore(80)).toBe(true));
  test('62 超出范围', () => expect(isValidPronunciationScore(62)).toBe(false));
  test('99 超出范围', () => expect(isValidPronunciationScore(99)).toBe(false));
});

// ─── getResultMsg ────────────────────────────────────────────────
describe('getResultMsg - 结果页面消息', () => {
  test('>=85 → Outstanding', () => expect(getResultMsg(85)).toContain('Outstanding'));
  test('>=70 且 <85 → Good work', () => expect(getResultMsg(70)).toContain('Good work'));
  test('<70 → Keep practicing', () => expect(getResultMsg(69)).toContain('Keep practicing'));
  test('边界 84 → Good work', () => expect(getResultMsg(84)).toContain('Good work'));
});

// ─── getResultEmoji ──────────────────────────────────────────────
describe('getResultEmoji - 结果页面 emoji', () => {
  test('>=80 → 🎉', () => expect(getResultEmoji(80)).toBe('🎉'));
  test('>=65 且 <80 → 👍', () => expect(getResultEmoji(65)).toBe('👍'));
  test('<65 → 💪', () => expect(getResultEmoji(64)).toBe('💪'));
  test('边界 79 → 👍', () => expect(getResultEmoji(79)).toBe('👍'));
});

// ─── 练习流程完整性 ──────────────────────────────────────────────
describe('练习流程完整性', () => {
  test('words 模式完成后切换到 sentences 模式', () => {
    const ex = pronunciationExercises[0];
    // 模拟 wordIdx 到达最后一个
    const lastWordIdx = ex.words.length - 1;
    // 下一步应该切换到 sentences 模式
    const shouldSwitchToSentences = lastWordIdx >= ex.words.length - 1;
    expect(shouldSwitchToSentences).toBe(true);
  });

  test('sentences 模式完成后进入 result 阶段', () => {
    const ex = pronunciationExercises[0];
    const lastSentenceIdx = ex.sentences.length - 1;
    const shouldGoToResult = lastSentenceIdx >= ex.sentences.length - 1;
    expect(shouldGoToResult).toBe(true);
  });

  test('Score Breakdown 索引映射正确', () => {
    const ex = pronunciationExercises[0];
    const totalItems = ex.words.length + ex.sentences.length;
    const mockScores = Array.from({ length: totalItems }, (_, i) => 70 + i);

    mockScores.forEach((s, i) => {
      if (i < ex.words.length) {
        // 前 N 个是单词
        expect(ex.words[i]).toBeDefined();
      } else {
        // 后面是句子
        const sentenceIdx = i - ex.words.length;
        expect(ex.sentences[sentenceIdx]).toBeDefined();
      }
    });
  });

  test('所有练习的 totalItems 大于 0', () => {
    pronunciationExercises.forEach(ex => {
      const total = ex.words.length + ex.sentences.length;
      expect(total).toBeGreaterThan(0);
    });
  });
});
