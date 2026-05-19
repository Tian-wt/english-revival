import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, SafeAreaView, Animated,
} from 'react-native';
import { Colors, Spacing, FontSize, Radius } from '../theme';
import { pronunciationExercises } from '../data/mockData';
import WaveformBar from '../components/WaveformBar';
import { useSpeech, useRecorder } from '../hooks/useAudio';

type Exercise = typeof pronunciationExercises[0];
type Phase = 'list' | 'practice' | 'result';

export default function PronunciationScreen() {
  const [phase, setPhase] = useState<Phase>('list');
  const [selectedEx, setSelectedEx] = useState<Exercise | null>(null);
  const [wordIdx, setWordIdx] = useState(0);
  const [sentenceIdx, setSentenceIdx] = useState(0);
  const [mode, setMode] = useState<'words' | 'sentences'>('words');
  const [scores, setScores] = useState<number[]>([]);
  const [currentScore, setCurrentScore] = useState<number | null>(null);
  const [showTip, setShowTip] = useState(true);
  const [hasRecorded, setHasRecorded] = useState(false);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const scoreAnim = useRef(new Animated.Value(0)).current;

  const { speak, isSpeaking } = useSpeech();
  const {
    isRecording,
    isPlaying,
    recordingUri,
    durationMs,
    startRecording,
    stopRecording,
    playRecording,
  } = useRecorder();

  useEffect(() => {
    if (isRecording) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.2, duration: 500, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
        ])
      ).start();
    } else {
      pulseAnim.stopAnimation();
      pulseAnim.setValue(1);
    }
  }, [isRecording]);

  const startExercise = (ex: Exercise) => {
    setSelectedEx(ex);
    setWordIdx(0);
    setSentenceIdx(0);
    setMode('words');
    setScores([]);
    setCurrentScore(null);
    setShowTip(true);
    setHasRecorded(false);
    setPhase('practice');
  };

  // 真实录音：按下开始，再按停止并评分
  const handleRecord = async () => {
    if (isRecording) {
      // 停止录音 → 模拟评分（真实场景接 Azure Pronunciation Assessment）
      await stopRecording();
      setHasRecorded(true);
      const mockScore = Math.floor(Math.random() * 35) + 63; // 63-98
      setCurrentScore(mockScore);
      setScores(prev => [...prev, mockScore]);
      scoreAnim.setValue(0);
      Animated.spring(scoreAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 80,
        friction: 6,
      }).start();
    } else {
      setCurrentScore(null);
      setHasRecorded(false);
      await startRecording();
    }
  };

  // 朗读当前单词/句子
  const handleListen = () => {
    if (!selectedEx) return;
    if (mode === 'words') {
      const w = selectedEx.words[wordIdx];
      // 只朗读单词本身（去掉 "→ xxx" 部分）
      const wordText = w.word.split('→')[0].split('/')[0].trim();
      speak(wordText, 0.8);
    } else {
      speak(selectedEx.sentences[sentenceIdx], 0.85);
    }
  };

  const handleNext = () => {
    if (!selectedEx) return;
    setCurrentScore(null);

    if (mode === 'words') {
      if (wordIdx < selectedEx.words.length - 1) {
        setWordIdx(prev => prev + 1);
      } else {
        setMode('sentences');
        setSentenceIdx(0);
      }
    } else {
      if (sentenceIdx < selectedEx.sentences.length - 1) {
        setSentenceIdx(prev => prev + 1);
      } else {
        setPhase('result');
      }
    }
  };

  const avgScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;

  const scoreColor = (s: number) => {
    if (s >= 85) return Colors.secondary;
    if (s >= 70) return Colors.accent;
    return Colors.danger;
  };

  const scoreLabel = (s: number) => {
    if (s >= 90) return 'Excellent! 🌟';
    if (s >= 80) return 'Great job! 👍';
    if (s >= 70) return 'Good effort 💪';
    return 'Keep practicing 🔄';
  };

  const difficultyStars = (d: number) => '★'.repeat(d) + '☆'.repeat(3 - d);

  // ── Exercise List ────────────────────────────────────────────
  if (phase === 'list') {
    return (
      <SafeAreaView style={styles.safe}>
        <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
          <Text style={styles.pageTitle}>Pronunciation</Text>
          <Text style={styles.pageSubtitle}>Master the sounds of English</Text>

          {pronunciationExercises.map(ex => (
            <TouchableOpacity
              key={ex.id}
              style={styles.exCard}
              onPress={() => startExercise(ex)}
              activeOpacity={0.8}
            >
              <View style={styles.exLeft}>
                <Text style={styles.exIcon}>{ex.icon}</Text>
                <View style={styles.exInfo}>
                  <Text style={styles.exCategory}>{ex.category}</Text>
                  <Text style={styles.exTitle}>{ex.title}</Text>
                  <Text style={styles.exDesc}>{ex.description}</Text>
                </View>
              </View>
              <View style={styles.exRight}>
                <Text style={styles.exCount}>{ex.words.length} words</Text>
                <Text style={styles.arrowText}>›</Text>
              </View>
            </TouchableOpacity>
          ))}
          <View style={{ height: 32 }} />
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ── Practice ─────────────────────────────────────────────────
  if (phase === 'practice' && selectedEx) {
    const totalItems = selectedEx.words.length + selectedEx.sentences.length;
    const completedItems = mode === 'words' ? wordIdx : selectedEx.words.length + sentenceIdx;
    const progress = completedItems / totalItems;

    const currentWord = mode === 'words' ? selectedEx.words[wordIdx] : null;
    const currentSentence = mode === 'sentences' ? selectedEx.sentences[sentenceIdx] : null;

    return (
      <SafeAreaView style={styles.safe}>
        <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          {/* Header */}
          <View style={styles.practiceHeader}>
            <TouchableOpacity onPress={() => setPhase('list')}>
              <Text style={styles.backText}>← Back</Text>
            </TouchableOpacity>
            <Text style={styles.practiceHeaderTitle}>{selectedEx.title}</Text>
            <Text style={styles.progressLabel}>{completedItems}/{totalItems}</Text>
          </View>

          {/* Progress */}
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: `${progress * 100}%` }]} />
          </View>

          {/* Mode Tabs */}
          <View style={styles.modeTabs}>
            <TouchableOpacity
              style={[styles.modeTab, mode === 'words' && styles.modeTabActive]}
              onPress={() => { setMode('words'); setCurrentScore(null); }}
            >
              <Text style={[styles.modeTabText, mode === 'words' && styles.modeTabTextActive]}>Words</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modeTab, mode === 'sentences' && styles.modeTabActive]}
              onPress={() => { setMode('sentences'); setCurrentScore(null); }}
            >
              <Text style={[styles.modeTabText, mode === 'sentences' && styles.modeTabTextActive]}>Sentences</Text>
            </TouchableOpacity>
          </View>

          {/* Tip Card */}
          {showTip && (
            <View style={styles.tipCard}>
              <View style={styles.tipHeader}>
                <Text style={styles.tipTitle}>💡 Pronunciation Tip</Text>
                <TouchableOpacity onPress={() => setShowTip(false)}>
                  <Text style={styles.tipClose}>✕</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.tipText}>{selectedEx.tip}</Text>
            </View>
          )}

          {/* Main Practice Card */}
          <View style={styles.practiceCard}>
            {mode === 'words' && currentWord && (
              <>
                <View style={styles.diffRow}>
                  <Text style={styles.diffStars}>{difficultyStars(currentWord.difficulty)}</Text>
                  <Text style={styles.diffLabel}>Difficulty</Text>
                </View>
                <Text style={styles.targetWord}>{currentWord.word}</Text>
                <Text style={styles.phonetic}>{currentWord.phonetic}</Text>
              </>
            )}
            {mode === 'sentences' && currentSentence && (
              <>
                <Text style={styles.sentenceLabel}>Sentence {sentenceIdx + 1}</Text>
                <Text style={styles.targetSentence}>{currentSentence}</Text>
              </>
            )}

            {/* Listen Button */}
            <TouchableOpacity style={styles.listenBtn} onPress={handleListen}>
              <Text style={styles.listenBtnText}>{isSpeaking ? '🔊 Playing...' : '🔊 Listen'}</Text>
            </TouchableOpacity>
          </View>

          {/* Score Display */}
          {currentScore !== null && (
            <Animated.View style={[styles.scoreCard, {
              transform: [{ scale: scoreAnim.interpolate({ inputRange: [0, 1], outputRange: [0.8, 1] }) }],
              opacity: scoreAnim,
            }]}>
              <Text style={[styles.scoreNum, { color: scoreColor(currentScore) }]}>{currentScore}</Text>
              <Text style={styles.scoreMax}>/100</Text>
              <Text style={[styles.scoreLabel, { color: scoreColor(currentScore) }]}>{scoreLabel(currentScore)}</Text>

              {/* Score Bar */}
              <View style={styles.scoreBarBg}>
                <View style={[styles.scoreBarFill, {
                  width: `${currentScore}%`,
                  backgroundColor: scoreColor(currentScore),
                }]} />
              </View>

              {/* 回放自己的录音 */}
              {recordingUri && (
                <TouchableOpacity style={styles.playbackBtn} onPress={() => playRecording()}>
                  <Text style={styles.playbackBtnText}>
                    {isPlaying ? '⏹ 停止回放' : '▶ 回放我的录音'}
                  </Text>
                </TouchableOpacity>
              )}

              {currentScore < 75 && (
                <Text style={styles.retryHint}>再录一次可以提高分数</Text>
              )}
            </Animated.View>
          )}

          {/* Waveform */}
          {isRecording && (
            <View style={styles.waveformContainer}>
              <WaveformBar isActive={true} color={Colors.danger} height={48} barCount={28} />
            </View>
          )}

          {/* Record Button */}
          <View style={styles.recordSection}>
            <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
              <TouchableOpacity
                style={[styles.recordBtn, isRecording && styles.recordBtnActive]}
                onPress={handleRecord}
              >
                <Text style={styles.recordBtnIcon}>{isRecording ? '⏹' : '🎤'}</Text>
              </TouchableOpacity>
            </Animated.View>
            <Text style={styles.recordHint}>
              {isRecording
                ? `录音中 ${(durationMs / 1000).toFixed(1)}s — 再按停止`
                : hasRecorded ? '再次录音' : '点击开始录音'}
            </Text>
          </View>

          {/* Next Button */}
          {currentScore !== null && (
            <TouchableOpacity style={styles.nextBtn} onPress={handleNext}>
              <Text style={styles.nextBtnText}>
                {mode === 'sentences' && sentenceIdx === selectedEx.sentences.length - 1
                  ? 'See Results →'
                  : 'Next →'}
              </Text>
            </TouchableOpacity>
          )}

          <View style={{ height: 32 }} />
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ── Result ───────────────────────────────────────────────────
  if (phase === 'result' && selectedEx) {
    return (
      <SafeAreaView style={styles.safe}>
        <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
          <Text style={styles.pageTitle}>Practice Complete!</Text>
          <Text style={styles.pageSubtitle}>{selectedEx.title}</Text>

          <View style={styles.resultCard}>
            <Text style={styles.resultEmoji}>{avgScore >= 80 ? '🎉' : avgScore >= 65 ? '👍' : '💪'}</Text>
            <Text style={[styles.resultScore, { color: scoreColor(avgScore) }]}>{avgScore}</Text>
            <Text style={styles.resultLabel}>Average Score</Text>
            <Text style={styles.resultMsg}>
              {avgScore >= 85 ? 'Outstanding pronunciation! You\'re sounding very natural.' :
               avgScore >= 70 ? 'Good work! A bit more practice and you\'ll nail it.' :
               'Keep practicing! Pronunciation improves with repetition.'}
            </Text>
          </View>

          {/* Per-item scores */}
          <Text style={styles.sectionTitle}>Score Breakdown</Text>
          {scores.map((s, i) => (
            <View key={i} style={styles.scoreBreakdownRow}>
              <Text style={styles.scoreBreakdownLabel}>
                {i < selectedEx.words.length
                  ? selectedEx.words[i]?.word
                  : selectedEx.sentences[i - selectedEx.words.length]?.substring(0, 30) + '...'}
              </Text>
              <View style={styles.scoreBreakdownBar}>
                <View style={[styles.scoreBreakdownFill, { width: `${s}%`, backgroundColor: scoreColor(s) }]} />
              </View>
              <Text style={[styles.scoreBreakdownNum, { color: scoreColor(s) }]}>{s}</Text>
            </View>
          ))}

          <TouchableOpacity style={styles.tryAgainBtn} onPress={() => startExercise(selectedEx)}>
            <Text style={styles.tryAgainText}>Practice Again</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.backToListBtn} onPress={() => setPhase('list')}>
            <Text style={styles.backToListText}>Choose Another Exercise</Text>
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

  exCard: {
    backgroundColor: Colors.card,
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  exLeft: { flex: 1, flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  exIcon: { fontSize: 32 },
  exInfo: { flex: 1 },
  exCategory: { fontSize: FontSize.xs, color: Colors.primary, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
  exTitle: { fontSize: FontSize.lg, fontWeight: '700', color: Colors.text, marginTop: 2 },
  exDesc: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 2 },
  exRight: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  exCount: { fontSize: FontSize.xs, color: Colors.textSecondary },
  arrowText: { fontSize: 24, color: Colors.textLight },

  practiceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
  },
  backText: { fontSize: FontSize.md, color: Colors.primary, fontWeight: '600' },
  practiceHeaderTitle: { fontSize: FontSize.md, fontWeight: '700', color: Colors.text },
  progressLabel: { fontSize: FontSize.sm, color: Colors.textSecondary },

  progressBarBg: { height: 6, backgroundColor: Colors.border, borderRadius: 3, marginBottom: Spacing.md },
  progressBarFill: { height: 6, backgroundColor: Colors.primary, borderRadius: 3 },

  modeTabs: {
    flexDirection: 'row',
    backgroundColor: Colors.border,
    borderRadius: Radius.md,
    padding: 3,
    marginBottom: Spacing.md,
  },
  modeTab: { flex: 1, paddingVertical: 8, borderRadius: Radius.sm - 2, alignItems: 'center' },
  modeTabActive: { backgroundColor: Colors.card },
  modeTabText: { fontSize: FontSize.sm, color: Colors.textSecondary, fontWeight: '600' },
  modeTabTextActive: { color: Colors.primary },

  tipCard: {
    backgroundColor: '#FFFBEB',
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderLeftWidth: 3,
    borderLeftColor: Colors.accent,
  },
  tipHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  tipTitle: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.accent },
  tipClose: { fontSize: FontSize.md, color: Colors.textSecondary },
  tipText: { fontSize: FontSize.sm, color: Colors.text, lineHeight: 20 },

  practiceCard: {
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    padding: Spacing.xl,
    alignItems: 'center',
    marginBottom: Spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  diffRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12 },
  diffStars: { fontSize: FontSize.md, color: Colors.accent },
  diffLabel: { fontSize: FontSize.xs, color: Colors.textSecondary },
  targetWord: { fontSize: 48, fontWeight: '700', color: Colors.text, marginBottom: 8 },
  phonetic: { fontSize: FontSize.lg, color: Colors.primary, marginBottom: Spacing.md, fontStyle: 'italic' },
  sentenceLabel: { fontSize: FontSize.sm, color: Colors.textSecondary, marginBottom: 12 },
  targetSentence: { fontSize: FontSize.xl, fontWeight: '600', color: Colors.text, textAlign: 'center', lineHeight: 32, marginBottom: Spacing.md },
  listenBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: Radius.full,
    gap: 6,
  },
  listenBtnText: { fontSize: FontSize.md, color: Colors.primary, fontWeight: '600' },

  scoreCard: {
    backgroundColor: Colors.card,
    borderRadius: Radius.md,
    padding: Spacing.md,
    alignItems: 'center',
    marginBottom: Spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  scoreNum: { fontSize: FontSize.xxxl, fontWeight: '700' },
  scoreMax: { fontSize: FontSize.md, color: Colors.textSecondary, marginTop: -4 },
  scoreLabel: { fontSize: FontSize.md, fontWeight: '600', marginBottom: 10 },
  scoreBarBg: { width: '100%', height: 8, backgroundColor: Colors.border, borderRadius: 4 },
  scoreBarFill: { height: 8, borderRadius: 4 },
  retryHint: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 8 },
  playbackBtn: {
    marginTop: 10,
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: Radius.full,
  },
  playbackBtnText: { fontSize: FontSize.sm, color: Colors.primary, fontWeight: '600' },

  waveformContainer: { alignItems: 'center', marginBottom: Spacing.md },

  recordSection: { alignItems: 'center', marginBottom: Spacing.md },
  recordBtn: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: Colors.primary,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
    marginBottom: 10,
  },
  recordBtnActive: { backgroundColor: Colors.danger },
  recordBtnIcon: { fontSize: 32 },
  recordHint: { fontSize: FontSize.sm, color: Colors.textSecondary, textAlign: 'center' },

  nextBtn: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.md,
    padding: Spacing.md,
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  nextBtnText: { color: '#fff', fontSize: FontSize.md, fontWeight: '700' },

  resultCard: {
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
  resultEmoji: { fontSize: 56, marginBottom: 8 },
  resultScore: { fontSize: FontSize.xxxl, fontWeight: '700' },
  resultLabel: { fontSize: FontSize.md, color: Colors.textSecondary, marginBottom: 12 },
  resultMsg: { fontSize: FontSize.md, color: Colors.text, textAlign: 'center', lineHeight: 22 },

  scoreBreakdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  scoreBreakdownLabel: { fontSize: FontSize.sm, color: Colors.text, width: 100 },
  scoreBreakdownBar: { flex: 1, height: 8, backgroundColor: Colors.border, borderRadius: 4 },
  scoreBreakdownFill: { height: 8, borderRadius: 4 },
  scoreBreakdownNum: { fontSize: FontSize.sm, fontWeight: '700', width: 30, textAlign: 'right' },

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
