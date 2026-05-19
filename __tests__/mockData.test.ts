/**
 * mockData 数据完整性测试
 * 验证所有 mock 数据结构正确、字段合法、无空值
 */
import {
  listeningLessons,
  conversationScenarios,
  pronunciationExercises,
  userProgress,
  dailyTasks,
} from '../src/data/mockData';

// ─── 听力课程 ────────────────────────────────────────────────────
describe('listeningLessons', () => {
  test('至少有 1 条课程', () => {
    expect(listeningLessons.length).toBeGreaterThan(0);
  });

  test('每条课程都有必要字段', () => {
    listeningLessons.forEach((lesson, i) => {
      expect(lesson.id).toBeTruthy();
      expect(lesson.title).toBeTruthy();
      expect(['Beginner', 'Intermediate', 'Advanced']).toContain(lesson.level);
      expect(lesson.duration).toMatch(/^\d+:\d{2}$/);
      expect(lesson.transcript.length).toBeGreaterThan(0);
      expect(lesson.keywords.length).toBeGreaterThan(0);
      expect(lesson.questions.length).toBeGreaterThan(0);
    });
  });

  test('transcript 每行都有 time 和 text', () => {
    listeningLessons.forEach(lesson => {
      lesson.transcript.forEach(line => {
        expect(typeof line.time).toBe('number');
        expect(line.text.trim().length).toBeGreaterThan(0);
      });
    });
  });

  test('quiz 答案索引在选项范围内', () => {
    listeningLessons.forEach(lesson => {
      lesson.questions.forEach(q => {
        expect(q.options.length).toBeGreaterThanOrEqual(2);
        expect(q.answer).toBeGreaterThanOrEqual(0);
        expect(q.answer).toBeLessThan(q.options.length);
      });
    });
  });

  test('transcript time 单调递增', () => {
    listeningLessons.forEach(lesson => {
      for (let i = 1; i < lesson.transcript.length; i++) {
        expect(lesson.transcript[i].time).toBeGreaterThanOrEqual(lesson.transcript[i - 1].time);
      }
    });
  });

  test('id 唯一', () => {
    const ids = listeningLessons.map(l => l.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

// ─── 口语场景 ────────────────────────────────────────────────────
describe('conversationScenarios', () => {
  test('至少有 1 个场景', () => {
    expect(conversationScenarios.length).toBeGreaterThan(0);
  });

  test('每个场景都有必要字段', () => {
    conversationScenarios.forEach(s => {
      expect(s.id).toBeTruthy();
      expect(s.title).toBeTruthy();
      expect(s.icon).toBeTruthy();
      expect(['Easy', 'Medium', 'Hard']).toContain(s.difficulty);
      expect(s.messages.length).toBeGreaterThan(0);
      expect(s.color).toMatch(/^#[0-9A-Fa-f]{6}$/);
    });
  });

  test('messages 第一条必须是 ai 角色（对话开场白）', () => {
    conversationScenarios.forEach(s => {
      expect(s.messages[0].role).toBe('ai');
    });
  });

  test('id 唯一', () => {
    const ids = conversationScenarios.map(s => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  test('estimatedTime 格式正确', () => {
    conversationScenarios.forEach(s => {
      expect(s.estimatedTime).toMatch(/^\d+ min$/);
    });
  });
});

// ─── 发音练习 ────────────────────────────────────────────────────
describe('pronunciationExercises', () => {
  test('至少有 1 个练习', () => {
    expect(pronunciationExercises.length).toBeGreaterThan(0);
  });

  test('每个练习都有必要字段', () => {
    pronunciationExercises.forEach(ex => {
      expect(ex.id).toBeTruthy();
      expect(ex.title).toBeTruthy();
      expect(ex.words.length).toBeGreaterThan(0);
      expect(ex.sentences.length).toBeGreaterThan(0);
      expect(ex.tip).toBeTruthy();
    });
  });

  test('words difficulty 在 1-3 范围内', () => {
    pronunciationExercises.forEach(ex => {
      ex.words.forEach(w => {
        expect(w.difficulty).toBeGreaterThanOrEqual(1);
        expect(w.difficulty).toBeLessThanOrEqual(3);
      });
    });
  });

  test('words 都有 phonetic 标注', () => {
    pronunciationExercises.forEach(ex => {
      ex.words.forEach(w => {
        expect(w.phonetic.trim().length).toBeGreaterThan(0);
      });
    });
  });

  test('sentences 都是非空字符串', () => {
    pronunciationExercises.forEach(ex => {
      ex.sentences.forEach(s => {
        expect(s.trim().length).toBeGreaterThan(0);
      });
    });
  });
});

// ─── 用户进度 ────────────────────────────────────────────────────
describe('userProgress', () => {
  test('所有分数在 0-100 范围内', () => {
    const { listeningScore, speakingScore, pronunciationScore, vocabularyScore } = userProgress.stats;
    [listeningScore, speakingScore, pronunciationScore, vocabularyScore].forEach(score => {
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(100);
    });
  });

  test('streak 为非负整数', () => {
    expect(userProgress.streak).toBeGreaterThanOrEqual(0);
    expect(Number.isInteger(userProgress.streak)).toBe(true);
  });

  test('weeklyCompleted 不超过 weeklyGoal', () => {
    expect(userProgress.weeklyCompleted).toBeLessThanOrEqual(userProgress.weeklyGoal);
  });

  test('recentActivity 有 7 天记录', () => {
    expect(userProgress.recentActivity.length).toBe(7);
  });

  test('recentActivity 日期格式正确', () => {
    userProgress.recentActivity.forEach(a => {
      expect(a.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(a.minutes).toBeGreaterThanOrEqual(0);
    });
  });

  test('badges 都有 id、name、icon、earned 字段', () => {
    userProgress.badges.forEach(b => {
      expect(b.id).toBeTruthy();
      expect(b.name).toBeTruthy();
      expect(b.icon).toBeTruthy();
      expect(typeof b.earned).toBe('boolean');
    });
  });
});

// ─── 每日任务 ────────────────────────────────────────────────────
describe('dailyTasks', () => {
  test('至少有 1 个任务', () => {
    expect(dailyTasks.length).toBeGreaterThan(0);
  });

  test('每个任务都有必要字段', () => {
    dailyTasks.forEach(t => {
      expect(t.id).toBeTruthy();
      expect(t.title).toBeTruthy();
      expect(['listening', 'speaking', 'pronunciation']).toContain(t.type);
      expect(t.duration).toBeGreaterThan(0);
      expect(typeof t.completed).toBe('boolean');
    });
  });

  test('id 唯一', () => {
    const ids = dailyTasks.map(t => t.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
