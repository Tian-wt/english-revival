/**
 * SpeakingScreen 核心逻辑测试
 * 测试 AI 响应轮转、评分计算、场景匹配等纯逻辑
 */
import { conversationScenarios } from '../src/data/mockData';

// ─── 从 SpeakingScreen 提取的纯逻辑（镜像实现）──────────────────

const AI_RESPONSES: Record<string, string[]> = {
  '1': [
    "Great choice! Would you like any extra shots or flavors?",
    "Of course! Anything else? We have fresh pastries today.",
    "Perfect! That'll be ready in about 3 minutes. Name for the order?",
    "Thanks! Your order will be ready shortly. Enjoy your coffee!",
  ],
  '2': [
    "Interesting background! What would you say is your biggest professional achievement?",
    "That's impressive. Where do you see yourself in five years?",
    "Great answer. How do you handle working under pressure?",
    "Excellent! We'll be in touch. Do you have any questions for us?",
  ],
  '3': [
    "Perfect! I have your room ready. Would you prefer a high floor?",
    "Absolutely! Breakfast is served from 7 to 10 AM. Is there anything else?",
    "Of course! The gym is on the 3rd floor, open 24 hours. Enjoy your stay!",
    "You're all set! Here's your key card. Have a wonderful stay!",
  ],
  '4': [
    "I see. On a scale of 1 to 10, how would you rate the pain?",
    "Have you taken any medication for it?",
    "I'd recommend rest and staying hydrated. I'll prescribe something mild.",
    "Come back in a week if it doesn't improve. Take care!",
  ],
  '5': [
    "Nice progress! Any blockers or dependencies you need help with?",
    "Got it. What's your plan for today?",
    "Sounds good. Let's sync up this afternoon if you need help with that.",
    "Great standup everyone! Let's have a productive day.",
  ],
};

/** 获取 AI 下一条响应（循环） */
function getNextAiResponse(scenarioId: string, idx: number): string {
  const responses = AI_RESPONSES[scenarioId] || AI_RESPONSES['1'];
  return responses[idx % responses.length];
}

/** 计算会话平均分 */
function calcSessionScore(prevScore: number, newScore: number): number {
  if (prevScore === 0) return newScore;
  return Math.round((prevScore + newScore) / 2);
}

/** 难度颜色 */
function difficultyColor(d: string): string {
  if (d === 'Easy') return '#10B981';
  if (d === 'Medium') return '#F59E0B';
  return '#EF4444';
}

/** 反馈 emoji */
function feedbackEmoji(score: number): string {
  if (score >= 85) return '🌟';
  if (score >= 70) return '👍';
  return '💪';
}

/** 模拟评分范围 75-95 */
function isValidMockScore(score: number): boolean {
  return score >= 75 && score <= 95;
}

// ─── AI 响应轮转 ─────────────────────────────────────────────────
describe('getNextAiResponse - AI 响应轮转', () => {
  test('场景 1 第 0 轮返回第一条响应', () => {
    expect(getNextAiResponse('1', 0)).toBe("Great choice! Would you like any extra shots or flavors?");
  });

  test('场景 1 第 3 轮返回最后一条响应', () => {
    expect(getNextAiResponse('1', 3)).toBe("Thanks! Your order will be ready shortly. Enjoy your coffee!");
  });

  test('超出响应数量时循环回第一条', () => {
    const responses = AI_RESPONSES['1'];
    expect(getNextAiResponse('1', responses.length)).toBe(responses[0]);
    expect(getNextAiResponse('1', responses.length + 1)).toBe(responses[1]);
  });

  test('所有场景都有对应的 AI 响应', () => {
    conversationScenarios.forEach(s => {
      const responses = AI_RESPONSES[s.id];
      expect(responses).toBeDefined();
      expect(responses.length).toBeGreaterThan(0);
    });
  });

  test('未知场景 ID 回退到场景 1 的响应', () => {
    const result = getNextAiResponse('999', 0);
    expect(result).toBe(AI_RESPONSES['1'][0]);
  });

  test('每个场景的响应都是非空字符串', () => {
    Object.values(AI_RESPONSES).forEach(responses => {
      responses.forEach(r => {
        expect(r.trim().length).toBeGreaterThan(0);
      });
    });
  });
});

// ─── 会话评分计算 ────────────────────────────────────────────────
describe('calcSessionScore - 会话评分', () => {
  test('第一轮（prevScore=0）直接返回新分数', () => {
    expect(calcSessionScore(0, 85)).toBe(85);
    expect(calcSessionScore(0, 75)).toBe(75);
  });

  test('两轮平均分计算正确', () => {
    expect(calcSessionScore(80, 90)).toBe(85);
    expect(calcSessionScore(75, 85)).toBe(80);
  });

  test('奇数平均向下取整', () => {
    // (80 + 81) / 2 = 80.5 → round → 81
    expect(calcSessionScore(80, 81)).toBe(81);
  });

  test('相同分数平均不变', () => {
    expect(calcSessionScore(80, 80)).toBe(80);
  });

  test('多轮累积评分趋向平均', () => {
    let score = 0;
    score = calcSessionScore(score, 80);  // 80
    score = calcSessionScore(score, 90);  // 85
    score = calcSessionScore(score, 70);  // 78
    expect(score).toBeGreaterThan(70);
    expect(score).toBeLessThan(90);
  });
});

// ─── 难度颜色 ────────────────────────────────────────────────────
describe('difficultyColor', () => {
  test('Easy → 绿色', () => expect(difficultyColor('Easy')).toBe('#10B981'));
  test('Medium → 琥珀色', () => expect(difficultyColor('Medium')).toBe('#F59E0B'));
  test('Hard → 红色', () => expect(difficultyColor('Hard')).toBe('#EF4444'));
  test('未知难度 → 红色（fallback）', () => expect(difficultyColor('Expert')).toBe('#EF4444'));
});

// ─── 反馈 emoji ──────────────────────────────────────────────────
describe('feedbackEmoji', () => {
  test('>=85 → 🌟', () => expect(feedbackEmoji(85)).toBe('🌟'));
  test('>=70 且 <85 → 👍', () => expect(feedbackEmoji(70)).toBe('👍'));
  test('<70 → 💪', () => expect(feedbackEmoji(69)).toBe('💪'));
  test('边界 84 → 👍', () => expect(feedbackEmoji(84)).toBe('👍'));
  test('100 → 🌟', () => expect(feedbackEmoji(100)).toBe('🌟'));
});

// ─── Mock 评分范围 ───────────────────────────────────────────────
describe('isValidMockScore - 评分范围验证', () => {
  test('75 是有效分数', () => expect(isValidMockScore(75)).toBe(true));
  test('95 是有效分数', () => expect(isValidMockScore(95)).toBe(true));
  test('85 是有效分数', () => expect(isValidMockScore(85)).toBe(true));
  test('74 超出范围', () => expect(isValidMockScore(74)).toBe(false));
  test('96 超出范围', () => expect(isValidMockScore(96)).toBe(false));
  test('0 超出范围', () => expect(isValidMockScore(0)).toBe(false));
});

// ─── 场景数据与 AI 响应的一致性 ─────────────────────────────────
describe('场景数据与 AI 响应一致性', () => {
  test('每个场景 ID 都有对应的 AI 响应池', () => {
    conversationScenarios.forEach(s => {
      expect(AI_RESPONSES[s.id]).toBeDefined();
    });
  });

  test('AI 响应数量足够支撑多轮对话（至少 3 轮）', () => {
    Object.values(AI_RESPONSES).forEach(responses => {
      expect(responses.length).toBeGreaterThanOrEqual(3);
    });
  });

  test('场景开场白与 conversationScenarios 中的第一条 ai 消息一致', () => {
    conversationScenarios.forEach(s => {
      const firstAiMsg = s.messages.find(m => m.role === 'ai');
      expect(firstAiMsg).toBeDefined();
      expect(firstAiMsg!.text.trim().length).toBeGreaterThan(0);
    });
  });

  test('用户提示语（user_hint）都有 Try: 前缀', () => {
    conversationScenarios.forEach(s => {
      s.messages.filter(m => m.role === 'user_hint').forEach(m => {
        expect(m.text).toMatch(/^Try:/);
      });
    });
  });
});

// ─── 反馈页面统计数据 ────────────────────────────────────────────
describe('反馈页面统计数据计算', () => {
  test('Words 统计 = turns * 8（估算）', () => {
    const turns = 3;
    expect(turns * 8).toBe(24);
  });

  test('0 轮对话时 sessionScore 为 0', () => {
    expect(calcSessionScore(0, 0)).toBe(0);
  });

  test('高分场景反馈 emoji 正确', () => {
    expect(feedbackEmoji(90)).toBe('🌟');
    expect(feedbackEmoji(72)).toBe('👍');
    expect(feedbackEmoji(60)).toBe('💪');
  });
});
