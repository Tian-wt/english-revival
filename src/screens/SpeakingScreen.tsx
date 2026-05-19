import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, SafeAreaView, Animated,
} from 'react-native';
import { Colors, Spacing, FontSize, Radius } from '../theme';
import { conversationScenarios } from '../data/mockData';
import WaveformBar from '../components/WaveformBar';
import { useSpeech, useRecorder } from '../hooks/useAudio';

type Scenario = typeof conversationScenarios[0];
type Phase = 'list' | 'chat' | 'feedback';

interface Message {
  role: 'ai' | 'user';
  text: string;
  score?: number;
  suggestion?: string;
}

// Mock AI responses
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

const MOCK_SUGGESTIONS: Record<string, string> = {
  "I want coffee": "More natural: \"I'd like a coffee, please\" or \"Could I get a coffee?\"",
  "I work in design": "More natural: \"I've been working in design for X years\" or \"My background is in design\"",
  "I have headache": "More natural: \"I have a headache\" or \"I've been having headaches\"",
  "default": "Good job! Your sentence was clear and natural.",
};

export default function SpeakingScreen() {
  const [phase, setPhase] = useState<Phase>('list');
  const [selectedScenario, setSelectedScenario] = useState<Scenario | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isAiTyping, setIsAiTyping] = useState(false);
  const [aiResponseIdx, setAiResponseIdx] = useState(0);
  const [sessionScore, setSessionScore] = useState(0);
  const [turnCount, setTurnCount] = useState(0);
  const scrollRef = useRef<ScrollView>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const { speak } = useSpeech();
  const {
    isRecording,
    durationMs,
    startRecording,
    stopRecording,
  } = useRecorder();

  useEffect(() => {
    if (isRecording) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.15, duration: 600, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
        ])
      ).start();
    } else {
      pulseAnim.stopAnimation();
      pulseAnim.setValue(1);
    }
  }, [isRecording]);

  const startScenario = (scenario: Scenario) => {
    setSelectedScenario(scenario);
    setMessages([{ role: 'ai', text: scenario.messages[0].text }]);
    setAiResponseIdx(0);
    setTurnCount(0);
    setSessionScore(0);
    setPhase('chat');
  };

  const mockUserPhrases = [
    "I'd like a large cappuccino with oat milk, please.",
    "I've been working in product design for about five years.",
    "Yes, I have a reservation under the name Johnson.",
    "I've been having a headache for the past three days.",
    "Yesterday I finished the authentication module and wrote unit tests.",
  ];

  const handleRecord = async () => {
    if (isRecording) {
      // ── 停止录音，提交 ──────────────────────────────────────
      await stopRecording();

      const scenarioIdx = conversationScenarios.findIndex(s => s.id === selectedScenario?.id);
      const phrase = mockUserPhrases[scenarioIdx] || mockUserPhrases[0];
      const score = Math.floor(Math.random() * 20) + 75; // 75-95（真实场景接 Whisper STT）
      const suggestion = MOCK_SUGGESTIONS['default'];

      const userMsg: Message = { role: 'user', text: phrase, score, suggestion };
      setMessages(prev => [...prev, userMsg]);
      setTurnCount(prev => prev + 1);
      setSessionScore(prev => prev === 0 ? score : Math.round((prev + score) / 2));

      // AI 回复
      setIsAiTyping(true);
      setTimeout(() => {
        const responses = AI_RESPONSES[selectedScenario?.id || '1'];
        const nextResponse = responses[aiResponseIdx % responses.length];
        setAiResponseIdx(prev => prev + 1);
        setMessages(prev => [...prev, { role: 'ai', text: nextResponse }]);
        setIsAiTyping(false);
        // AI 回复用 TTS 朗读出来
        speak(nextResponse, 0.9);
        setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
      }, 800);
    } else {
      // ── 开始录音 ────────────────────────────────────────────
      await startRecording();
    }
  };

  const endSession = () => setPhase('feedback');

  const difficultyColor = (d: string) => {
    if (d === 'Easy') return '#10B981';
    if (d === 'Medium') return '#F59E0B';
    return '#EF4444';
  };

  // ── Scenario List ────────────────────────────────────────────
  if (phase === 'list') {
    return (
      <SafeAreaView style={styles.safe}>
        <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
          <Text style={styles.pageTitle}>AI Conversation</Text>
          <Text style={styles.pageSubtitle}>Practice real-life English scenarios</Text>

          {conversationScenarios.map(scenario => (
            <TouchableOpacity
              key={scenario.id}
              style={[styles.scenarioCard, { borderLeftColor: scenario.color }]}
              onPress={() => startScenario(scenario)}
              activeOpacity={0.8}
            >
              <View style={styles.scenarioLeft}>
                <Text style={styles.scenarioIcon}>{scenario.icon}</Text>
                <View style={styles.scenarioInfo}>
                  <Text style={styles.scenarioTitle}>{scenario.title}</Text>
                  <Text style={styles.scenarioDesc}>{scenario.description}</Text>
                  <View style={styles.scenarioMeta}>
                    <View style={[styles.diffBadge, { backgroundColor: difficultyColor(scenario.difficulty) + '20' }]}>
                      <Text style={[styles.diffText, { color: difficultyColor(scenario.difficulty) }]}>
                        {scenario.difficulty}
                      </Text>
                    </View>
                    <Text style={styles.scenarioTime}>⏱ {scenario.estimatedTime}</Text>
                  </View>
                </View>
              </View>
              <Text style={styles.arrowText}>›</Text>
            </TouchableOpacity>
          ))}
          <View style={{ height: 32 }} />
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ── Chat ─────────────────────────────────────────────────────
  if (phase === 'chat' && selectedScenario) {
    return (
      <SafeAreaView style={styles.safe}>
        {/* Header */}
        <View style={styles.chatHeader}>
          <TouchableOpacity onPress={() => setPhase('list')}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
          <View style={styles.chatHeaderCenter}>
            <Text style={styles.chatScenarioIcon}>{selectedScenario.icon}</Text>
            <Text style={styles.chatTitle}>{selectedScenario.title}</Text>
          </View>
          <TouchableOpacity onPress={endSession} style={styles.endBtn}>
            <Text style={styles.endBtnText}>End</Text>
          </TouchableOpacity>
        </View>

        {/* Hint Banner */}
        <View style={styles.hintBanner}>
          <Text style={styles.hintText}>💡 Speak naturally — AI will gently correct you after each turn</Text>
        </View>

        {/* Messages */}
        <ScrollView
          ref={scrollRef}
          style={styles.chatScroll}
          contentContainerStyle={styles.chatContent}
          showsVerticalScrollIndicator={false}
        >
          {messages.map((msg, i) => (
            <View key={i} style={msg.role === 'ai' ? styles.aiBubbleWrap : styles.userBubbleWrap}>
              {msg.role === 'ai' && (
                <View style={styles.aiAvatar}>
                  <Text style={styles.aiAvatarText}>AI</Text>
                </View>
              )}
              <View style={[styles.bubble, msg.role === 'ai' ? styles.aiBubble : styles.userBubble]}>
                <Text style={[styles.bubbleText, msg.role === 'user' && styles.userBubbleText]}>
                  {msg.text}
                </Text>
                {msg.role === 'user' && msg.score !== undefined && (
                  <View style={styles.scoreRow}>
                    <Text style={styles.scoreText}>Fluency: {msg.score}/100</Text>
                  </View>
                )}
              </View>
            </View>
          ))}

          {/* Suggestion for last user message */}
          {messages.length > 0 && messages[messages.length - 1].role === 'user' && (
            <View style={styles.suggestionCard}>
              <Text style={styles.suggestionLabel}>💡 Suggestion</Text>
              <Text style={styles.suggestionText}>{messages[messages.length - 1].suggestion}</Text>
            </View>
          )}

          {isAiTyping && (
            <View style={styles.aiBubbleWrap}>
              <View style={styles.aiAvatar}>
                <Text style={styles.aiAvatarText}>AI</Text>
              </View>
              <View style={[styles.bubble, styles.aiBubble, styles.typingBubble]}>
                <Text style={styles.typingDots}>● ● ●</Text>
              </View>
            </View>
          )}
        </ScrollView>

        {/* Recording Controls */}
        <View style={styles.recordingArea}>
          {isRecording && (
            <View style={styles.waveformContainer}>
              <WaveformBar isActive={true} color={Colors.danger} height={36} barCount={24} />
            </View>
          )}
          <View style={styles.recordRow}>
            <Text style={styles.recordHint}>
              {isRecording ? `🔴 ${(durationMs / 1000).toFixed(1)}s — 再按提交` : '点击说话'}
            </Text>
            <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
              <TouchableOpacity
                style={[styles.recordBtn, isRecording && styles.recordBtnActive]}
                onPress={handleRecord}
                disabled={isAiTyping}
              >
                <Text style={styles.recordBtnIcon}>{isRecording ? '⏹' : '🎤'}</Text>
              </TouchableOpacity>
            </Animated.View>
            <Text style={styles.turnCount}>Turn {turnCount + 1}</Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // ── Feedback ─────────────────────────────────────────────────
  if (phase === 'feedback' && selectedScenario) {
    const userMessages = messages.filter(m => m.role === 'user');
    return (
      <SafeAreaView style={styles.safe}>
        <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
          <Text style={styles.pageTitle}>Session Complete!</Text>
          <Text style={styles.pageSubtitle}>{selectedScenario.title}</Text>

          <View style={styles.feedbackScoreCard}>
            <Text style={styles.feedbackEmoji}>
              {sessionScore >= 85 ? '🌟' : sessionScore >= 70 ? '👍' : '💪'}
            </Text>
            <Text style={styles.feedbackScore}>{sessionScore}</Text>
            <Text style={styles.feedbackScoreLabel}>Overall Fluency Score</Text>
            <View style={styles.feedbackStats}>
              <View style={styles.feedbackStat}>
                <Text style={styles.feedbackStatNum}>{userMessages.length}</Text>
                <Text style={styles.feedbackStatLabel}>Turns</Text>
              </View>
              <View style={styles.feedbackStatDivider} />
              <View style={styles.feedbackStat}>
                <Text style={styles.feedbackStatNum}>{userMessages.length * 8}</Text>
                <Text style={styles.feedbackStatLabel}>Words</Text>
              </View>
              <View style={styles.feedbackStatDivider} />
              <View style={styles.feedbackStat}>
                <Text style={styles.feedbackStatNum}>{selectedScenario.estimatedTime}</Text>
                <Text style={styles.feedbackStatLabel}>Duration</Text>
              </View>
            </View>
          </View>

          <Text style={styles.sectionTitle}>What You Said</Text>
          {userMessages.map((msg, i) => (
            <View key={i} style={styles.reviewMsgCard}>
              <View style={styles.reviewMsgHeader}>
                <Text style={styles.reviewMsgNum}>Turn {i + 1}</Text>
                <Text style={[styles.reviewMsgScore, { color: (msg.score || 0) >= 80 ? Colors.secondary : Colors.accent }]}>
                  {msg.score}/100
                </Text>
              </View>
              <Text style={styles.reviewMsgText}>"{msg.text}"</Text>
              <Text style={styles.reviewMsgSuggestion}>{msg.suggestion}</Text>
            </View>
          ))}

          <TouchableOpacity style={styles.tryAgainBtn} onPress={() => startScenario(selectedScenario)}>
            <Text style={styles.tryAgainText}>Try Again</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.backToListBtn} onPress={() => setPhase('list')}>
            <Text style={styles.backToListText}>Choose Another Scenario</Text>
          </TouchableOpacity>
          <View style={{ height: 32 }} />
        </ScrollView>
      </SafeAreaView>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  scroll: { flex: 1, paddingHorizontal: Spacing.md },
  pageTitle: { fontSize: FontSize.xxl, fontWeight: '700', color: Colors.text, marginTop: Spacing.lg },
  pageSubtitle: { fontSize: FontSize.md, color: Colors.textSecondary, marginBottom: Spacing.lg, marginTop: 4 },
  sectionTitle: { fontSize: FontSize.lg, fontWeight: '700', color: Colors.text, marginBottom: Spacing.sm, marginTop: Spacing.sm },

  scenarioCard: {
    backgroundColor: Colors.card,
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  scenarioLeft: { flex: 1, flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  scenarioIcon: { fontSize: 32 },
  scenarioInfo: { flex: 1 },
  scenarioTitle: { fontSize: FontSize.lg, fontWeight: '700', color: Colors.text },
  scenarioDesc: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 2, marginBottom: 8 },
  scenarioMeta: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  diffBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: Radius.full },
  diffText: { fontSize: FontSize.xs, fontWeight: '600' },
  scenarioTime: { fontSize: FontSize.xs, color: Colors.textSecondary },
  arrowText: { fontSize: 24, color: Colors.textLight },

  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.card,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backText: { fontSize: FontSize.md, color: Colors.primary, fontWeight: '600' },
  chatHeaderCenter: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  chatScenarioIcon: { fontSize: 20 },
  chatTitle: { fontSize: FontSize.md, fontWeight: '700', color: Colors.text },
  endBtn: { backgroundColor: '#FEE2E2', paddingHorizontal: 12, paddingVertical: 6, borderRadius: Radius.full },
  endBtnText: { fontSize: FontSize.sm, color: Colors.danger, fontWeight: '600' },

  hintBanner: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
  },
  hintText: { fontSize: FontSize.xs, color: Colors.primary, textAlign: 'center' },

  chatScroll: { flex: 1 },
  chatContent: { padding: Spacing.md, gap: 12 },

  aiBubbleWrap: { flexDirection: 'row', gap: 8, alignItems: 'flex-end' },
  userBubbleWrap: { flexDirection: 'row-reverse', gap: 8, alignItems: 'flex-end' },
  aiAvatar: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: Colors.primary,
    alignItems: 'center', justifyContent: 'center',
  },
  aiAvatarText: { color: '#fff', fontSize: FontSize.xs, fontWeight: '700' },
  bubble: { maxWidth: '75%', borderRadius: Radius.md, padding: 12 },
  aiBubble: { backgroundColor: Colors.card, borderBottomLeftRadius: 4 },
  userBubble: { backgroundColor: Colors.primary, borderBottomRightRadius: 4 },
  bubbleText: { fontSize: FontSize.md, color: Colors.text, lineHeight: 22 },
  userBubbleText: { color: '#fff' },
  scoreRow: { marginTop: 6, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.3)', paddingTop: 4 },
  scoreText: { fontSize: FontSize.xs, color: 'rgba(255,255,255,0.8)' },
  typingBubble: { paddingVertical: 14 },
  typingDots: { color: Colors.textSecondary, letterSpacing: 4 },

  suggestionCard: {
    backgroundColor: '#FFFBEB',
    borderRadius: Radius.sm,
    padding: 10,
    borderLeftWidth: 3,
    borderLeftColor: Colors.accent,
    marginLeft: 40,
  },
  suggestionLabel: { fontSize: FontSize.xs, fontWeight: '700', color: Colors.accent, marginBottom: 2 },
  suggestionText: { fontSize: FontSize.sm, color: Colors.text, lineHeight: 20 },

  recordingArea: {
    backgroundColor: Colors.card,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    paddingBottom: Spacing.lg,
  },
  waveformContainer: { alignItems: 'center', marginBottom: 8 },
  recordRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  recordHint: { fontSize: FontSize.sm, color: Colors.textSecondary, width: 80 },
  recordBtn: {
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: Colors.primary,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  recordBtnActive: { backgroundColor: Colors.danger },
  recordBtnIcon: { fontSize: 28 },
  turnCount: { fontSize: FontSize.sm, color: Colors.textSecondary, width: 80, textAlign: 'right' },

  feedbackScoreCard: {
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    padding: Spacing.xl,
    alignItems: 'center',
    marginTop: Spacing.md,
    marginBottom: Spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  feedbackEmoji: { fontSize: 56, marginBottom: 8 },
  feedbackScore: { fontSize: FontSize.xxxl, fontWeight: '700', color: Colors.primary },
  feedbackScoreLabel: { fontSize: FontSize.md, color: Colors.textSecondary, marginBottom: Spacing.md },
  feedbackStats: { flexDirection: 'row', alignItems: 'center', gap: Spacing.lg },
  feedbackStat: { alignItems: 'center' },
  feedbackStatNum: { fontSize: FontSize.xl, fontWeight: '700', color: Colors.text },
  feedbackStatLabel: { fontSize: FontSize.xs, color: Colors.textSecondary },
  feedbackStatDivider: { width: 1, height: 32, backgroundColor: Colors.border },

  reviewMsgCard: {
    backgroundColor: Colors.card,
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  reviewMsgHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  reviewMsgNum: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.textSecondary },
  reviewMsgScore: { fontSize: FontSize.sm, fontWeight: '700' },
  reviewMsgText: { fontSize: FontSize.md, color: Colors.text, fontStyle: 'italic', marginBottom: 6 },
  reviewMsgSuggestion: { fontSize: FontSize.sm, color: Colors.textSecondary, lineHeight: 20 },

  tryAgainBtn: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.md,
    padding: Spacing.md,
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  tryAgainText: { color: '#fff', fontSize: FontSize.md, fontWeight: '700' },
  backToListBtn: {
    backgroundColor: Colors.card,
    borderRadius: Radius.md,
    padding: Spacing.md,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: Colors.primary,
  },
  backToListText: { color: Colors.primary, fontSize: FontSize.md, fontWeight: '700' },
});
