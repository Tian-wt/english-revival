import React, { useState, useRef } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, SafeAreaView, Animated,
} from 'react-native';
import { Colors, Spacing, FontSize, Radius } from '../theme';
import { listeningLessons } from '../data/mockData';
import { useSpeech } from '../hooks/useAudio';

type Lesson = typeof listeningLessons[0];
type Phase = 'list' | 'player' | 'quiz' | 'result';

export default function ListeningScreen() {
  const [phase, setPhase] = useState<Phase>('list');
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [showTranscript, setShowTranscript] = useState(false);
  const [revealedLines, setRevealedLines] = useState<number[]>([]);
  const [quizAnswers, setQuizAnswers] = useState<number[]>([]);
  const [score, setScore] = useState(0);
  const [currentLineIdx, setCurrentLineIdx] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const progressAnim = useRef(new Animated.Value(0)).current;
  const { speak, stop: stopSpeech, isSpeaking } = useSpeech();

  // 用对话总字数估算时长（每个单词约 0.4 秒）
  const getTotalSeconds = (lesson: Lesson) => {
    const totalWords = lesson.transcript.reduce((sum, l) => sum + l.text.split(' ').length, 0);
    return Math.max(totalWords * 0.4, 15);
  };

  const startLesson = (lesson: Lesson) => {
    setSelectedLesson(lesson);
    setPhase('player');
    setCurrentTime(0);
    setIsPlaying(false);
    setShowTranscript(false);
    setRevealedLines([]);
    setPlaybackRate(1.0);
    progressAnim.setValue(0);
  };

  // 逐句朗读整段对话
  const speakAllLines = (lesson: Lesson, startIdx: number = 0, rate: number = playbackRate) => {
    if (startIdx >= lesson.transcript.length) {
      setIsPlaying(false);
      setCurrentLineIdx(0);
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }
    const line = lesson.transcript[startIdx];
    setCurrentLineIdx(startIdx);
    // 自动展示当前行
    setRevealedLines(prev => prev.includes(startIdx) ? prev : [...prev, startIdx]);

    const wordCount = line.text.split(' ').length;
    // 根据倍速调整等待时间：速度越快，等待越短
    const estimatedMs = (wordCount * 400 + 600) / rate;

    speak(line.text, rate * 0.88);

    // 等这句说完再说下一句
    const nextTimer = setTimeout(() => {
      speakAllLines(lesson, startIdx + 1, rate);
    }, estimatedMs);

    // 存到 timerRef 以便暂停时清除
    timerRef.current = nextTimer as unknown as ReturnType<typeof setInterval>;
  };

  const togglePlay = () => {
    if (!selectedLesson) return;
    const TOTAL_SECONDS = getTotalSeconds(selectedLesson);

    if (isPlaying) {
      // 暂停
      if (timerRef.current) clearInterval(timerRef.current);
      stopSpeech();
      setIsPlaying(false);
      progressAnim.stopAnimation();
    } else {
      // 播放
      setIsPlaying(true);
      // 进度条动画
      Animated.timing(progressAnim, {
        toValue: 1,
        duration: (TOTAL_SECONDS - currentTime) * 1000,
        useNativeDriver: false,
      }).start(({ finished }) => {
        if (finished) {
          setIsPlaying(false);
          setCurrentTime(TOTAL_SECONDS);
        }
      });
      // 计时器
      const interval = setInterval(() => {
        setCurrentTime(prev => {
          if (prev >= TOTAL_SECONDS) {
            clearInterval(interval);
            setIsPlaying(false);
            return TOTAL_SECONDS;
          }
          return prev + 1;
        });
      }, 1000);

      // 开始逐句朗读（从当前行继续）
      speakAllLines(selectedLesson, currentLineIdx, playbackRate);
    }
  };

  const revealLine = (idx: number) => {
    setRevealedLines(prev => prev.includes(idx) ? prev : [...prev, idx]);
  };

  const startQuiz = () => {
    setQuizAnswers([]);
    setPhase('quiz');
  };

  const selectAnswer = (qIdx: number, aIdx: number) => {
    const newAnswers = [...quizAnswers];
    newAnswers[qIdx] = aIdx;
    setQuizAnswers(newAnswers);
  };

  const submitQuiz = () => {
    if (!selectedLesson) return;
    let correct = 0;
    selectedLesson.questions.forEach((q, i) => {
      if (quizAnswers[i] === q.answer) correct++;
    });
    setScore(correct);
    setPhase('result');
  };

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  const levelColor = (level: string) => {
    if (level === 'Beginner') return '#10B981';
    if (level === 'Intermediate') return '#F59E0B';
    return '#EF4444';
  };

  // ── Lesson List ──────────────────────────────────────────────
  if (phase === 'list') {
    return (
      <SafeAreaView style={styles.safe}>
        <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
          <Text style={styles.pageTitle}>Listening Training</Text>
          <Text style={styles.pageSubtitle}>Build your ear for natural English</Text>

          {listeningLessons.map(lesson => (
            <TouchableOpacity
              key={lesson.id}
              style={styles.lessonCard}
              onPress={() => startLesson(lesson)}
              activeOpacity={0.8}
            >
              <View style={styles.lessonTop}>
                <View style={[styles.levelBadge, { backgroundColor: levelColor(lesson.level) + '20' }]}>
                  <Text style={[styles.levelText, { color: levelColor(lesson.level) }]}>{lesson.level}</Text>
                </View>
                <Text style={styles.lessonDuration}>⏱ {lesson.duration}</Text>
              </View>
              <Text style={styles.lessonTitle}>{lesson.title}</Text>
              <Text style={styles.lessonTopic}>📂 {lesson.topic}</Text>
              <View style={styles.keywordsRow}>
                {lesson.keywords.slice(0, 3).map(kw => (
                  <View key={kw} style={styles.keyword}>
                    <Text style={styles.keywordText}>{kw}</Text>
                  </View>
                ))}
              </View>
            </TouchableOpacity>
          ))}
          <View style={{ height: 32 }} />
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ── Player ───────────────────────────────────────────────────
  if (phase === 'player' && selectedLesson) {
    return (
      <SafeAreaView style={styles.safe}>
        <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
          <TouchableOpacity onPress={() => setPhase('list')} style={styles.backBtn}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>

          <Text style={styles.playerTitle}>{selectedLesson.title}</Text>
          <Text style={styles.playerMeta}>{selectedLesson.level} · {selectedLesson.topic}</Text>

          {/* Player Card */}
          <View style={styles.playerCard}>
            <Text style={styles.playerEmoji}>{isPlaying ? '🔊' : '🎧'}</Text>

            {/* Progress Bar */}
            <View style={styles.playerBarBg}>
              <Animated.View style={[styles.playerBarFill, {
                width: progressAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] })
              }]} />
            </View>
            <View style={styles.timeRow}>
              <Text style={styles.timeText}>{formatTime(currentTime)}</Text>
              <Text style={styles.timeText}>{selectedLesson.duration}</Text>
            </View>

            {/* Controls */}
            <View style={styles.controls}>
              <TouchableOpacity style={styles.skipBtn} onPress={() => {
                stopSpeech();
                setCurrentLineIdx(0);
                setCurrentTime(0);
                progressAnim.setValue(0);
                setIsPlaying(false);
              }}>
                <Text style={styles.skipText}>⏮ 重播</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.playBtn} onPress={togglePlay}>
                <Text style={styles.playBtnText}>{isPlaying ? '⏸' : '▶'}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.skipBtn} onPress={() => {
                // 跳到下一句
                if (selectedLesson && currentLineIdx < selectedLesson.transcript.length - 1) {
                  stopSpeech();
                  if (timerRef.current) clearTimeout(timerRef.current as unknown as ReturnType<typeof setTimeout>);
                  if (isPlaying) speakAllLines(selectedLesson, currentLineIdx + 1, playbackRate);
                  else setCurrentLineIdx(prev => prev + 1);
                }
              }}>
                <Text style={styles.skipText}>下一句 ⏭</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.speedRow}>
              {([0.75, 1.0, 1.25] as const).map(s => (
                <TouchableOpacity
                  key={s}
                  style={[styles.speedBtn, playbackRate === s && styles.speedBtnActive]}
                  onPress={() => {
                    setPlaybackRate(s);
                    if (isPlaying && selectedLesson) {
                      stopSpeech();
                      if (timerRef.current) clearTimeout(timerRef.current as unknown as ReturnType<typeof setTimeout>);
                      speakAllLines(selectedLesson, currentLineIdx, s);
                    }
                  }}
                >
                  <Text style={[styles.speedText, playbackRate === s && styles.speedTextActive]}>{s}x</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Transcript */}
          <View style={styles.transcriptSection}>
            <View style={styles.transcriptHeader}>
              <Text style={styles.transcriptTitle}>Transcript</Text>
              <TouchableOpacity onPress={() => setShowTranscript(!showTranscript)}>
                <Text style={styles.transcriptToggle}>{showTranscript ? 'Hide All' : 'Show All'}</Text>
              </TouchableOpacity>
            </View>
            {selectedLesson.transcript.map((line, i) => (
              <View key={i} style={[styles.transcriptLine, i === currentLineIdx && isPlaying && styles.transcriptLineActive]}>
                <Text style={styles.transcriptTime}>{formatTime(line.time)}</Text>
                {showTranscript || revealedLines.includes(i) ? (
                  <TouchableOpacity onPress={() => speak(line.text, playbackRate * 0.88)} style={{ flex: 1 }}>
                    <Text style={[styles.transcriptText, i === currentLineIdx && isPlaying && styles.transcriptTextActive]}>
                      {line.text} <Text style={styles.tapToHear}>🔊</Text>
                    </Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity onPress={() => revealLine(i)} style={styles.revealBtn}>
                    <Text style={styles.revealText}>Tap to reveal this line</Text>
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </View>

          <TouchableOpacity style={styles.quizBtn} onPress={startQuiz}>
            <Text style={styles.quizBtnText}>Take Comprehension Quiz →</Text>
          </TouchableOpacity>
          <View style={{ height: 32 }} />
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ── Quiz ─────────────────────────────────────────────────────
  if (phase === 'quiz' && selectedLesson) {
    return (
      <SafeAreaView style={styles.safe}>
        <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
          <TouchableOpacity onPress={() => setPhase('player')} style={styles.backBtn}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.pageTitle}>Comprehension Quiz</Text>
          <Text style={styles.pageSubtitle}>{selectedLesson.title}</Text>

          {selectedLesson.questions.map((q, qi) => (
            <View key={qi} style={styles.questionCard}>
              <Text style={styles.questionText}>Q{qi + 1}. {q.q}</Text>
              {q.options.map((opt, oi) => (
                <TouchableOpacity
                  key={oi}
                  style={[styles.optionBtn, quizAnswers[qi] === oi && styles.optionBtnSelected]}
                  onPress={() => selectAnswer(qi, oi)}
                >
                  <View style={[styles.optionDot, quizAnswers[qi] === oi && styles.optionDotSelected]} />
                  <Text style={[styles.optionText, quizAnswers[qi] === oi && styles.optionTextSelected]}>{opt}</Text>
                </TouchableOpacity>
              ))}
            </View>
          ))}

          <TouchableOpacity
            style={[styles.submitBtn, quizAnswers.length < selectedLesson.questions.length && styles.submitBtnDisabled]}
            onPress={submitQuiz}
            disabled={quizAnswers.length < selectedLesson.questions.length}
          >
            <Text style={styles.submitBtnText}>Submit Answers</Text>
          </TouchableOpacity>
          <View style={{ height: 32 }} />
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ── Result ───────────────────────────────────────────────────
  if (phase === 'result' && selectedLesson) {
    const total = selectedLesson.questions.length;
    const pct = Math.round((score / total) * 100);
    return (
      <SafeAreaView style={styles.safe}>
        <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
          <View style={styles.resultCard}>
            <Text style={styles.resultEmoji}>{pct >= 80 ? '🎉' : pct >= 50 ? '👍' : '💪'}</Text>
            <Text style={styles.resultScore}>{score}/{total}</Text>
            <Text style={styles.resultPct}>{pct}% Correct</Text>
            <Text style={styles.resultMsg}>
              {pct >= 80 ? 'Excellent! Your listening comprehension is strong.' :
               pct >= 50 ? 'Good effort! Keep practicing to improve.' :
               'Keep going! Listening takes time to develop.'}
            </Text>
          </View>

          {selectedLesson.questions.map((q, qi) => (
            <View key={qi} style={styles.reviewCard}>
              <Text style={styles.reviewQ}>Q{qi + 1}. {q.q}</Text>
              {q.options.map((opt, oi) => (
                <View key={oi} style={[
                  styles.reviewOpt,
                  oi === q.answer && styles.reviewOptCorrect,
                  quizAnswers[qi] === oi && oi !== q.answer && styles.reviewOptWrong,
                ]}>
                  <Text style={styles.reviewOptText}>{opt}</Text>
                  {oi === q.answer && <Text style={styles.reviewMark}>✓</Text>}
                  {quizAnswers[qi] === oi && oi !== q.answer && <Text style={styles.reviewMarkWrong}>✗</Text>}
                </View>
              ))}
            </View>
          ))}

          <TouchableOpacity style={styles.doneBtn} onPress={() => setPhase('list')}>
            <Text style={styles.doneBtnText}>Back to Lessons</Text>
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

  lessonCard: {
    backgroundColor: Colors.card,
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  lessonTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  levelBadge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: Radius.full },
  levelText: { fontSize: FontSize.xs, fontWeight: '600' },
  lessonDuration: { fontSize: FontSize.sm, color: Colors.textSecondary },
  lessonTitle: { fontSize: FontSize.lg, fontWeight: '700', color: Colors.text, marginBottom: 4 },
  lessonTopic: { fontSize: FontSize.sm, color: Colors.textSecondary, marginBottom: 8 },
  keywordsRow: { flexDirection: 'row', gap: 6 },
  keyword: { backgroundColor: '#EEF2FF', paddingHorizontal: 8, paddingVertical: 3, borderRadius: Radius.full },
  keywordText: { fontSize: FontSize.xs, color: Colors.primary },

  backBtn: { marginTop: Spacing.md, marginBottom: Spacing.sm },
  backText: { fontSize: FontSize.md, color: Colors.primary, fontWeight: '600' },
  playerTitle: { fontSize: FontSize.xxl, fontWeight: '700', color: Colors.text },
  playerMeta: { fontSize: FontSize.sm, color: Colors.textSecondary, marginBottom: Spacing.md, marginTop: 4 },

  playerCard: {
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    alignItems: 'center',
    marginBottom: Spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  playerEmoji: { fontSize: 64, marginBottom: Spacing.md },
  playerBarBg: { width: '100%', height: 6, backgroundColor: Colors.border, borderRadius: 3, marginBottom: 8 },
  playerBarFill: { height: 6, backgroundColor: Colors.primary, borderRadius: 3 },
  timeRow: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginBottom: Spacing.md },
  timeText: { fontSize: FontSize.sm, color: Colors.textSecondary },
  controls: { flexDirection: 'row', alignItems: 'center', gap: Spacing.lg, marginBottom: Spacing.md },
  skipBtn: { padding: 8 },
  skipText: { fontSize: FontSize.sm, color: Colors.textSecondary },
  playBtn: {
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: Colors.primary,
    alignItems: 'center', justifyContent: 'center',
  },
  playBtnText: { fontSize: 28, color: '#fff' },
  speedRow: { flexDirection: 'row', gap: 8 },
  speedBtn: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: Radius.full, borderWidth: 1, borderColor: Colors.border },
  speedBtnActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  speedText: { fontSize: FontSize.sm, color: Colors.textSecondary },
  speedTextActive: { color: '#fff', fontWeight: '600' },

  transcriptSection: { marginBottom: Spacing.md },
  transcriptHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: Spacing.sm },
  transcriptTitle: { fontSize: FontSize.lg, fontWeight: '700', color: Colors.text },
  transcriptToggle: { fontSize: FontSize.sm, color: Colors.primary, fontWeight: '600' },
  transcriptLine: { flexDirection: 'row', gap: 10, marginBottom: 12, alignItems: 'flex-start' },
  transcriptTime: { fontSize: FontSize.xs, color: Colors.textLight, width: 36, marginTop: 2 },
  transcriptText: { flex: 1, fontSize: FontSize.md, color: Colors.text, lineHeight: 22 },
  transcriptLineActive: { backgroundColor: '#EEF2FF', borderRadius: Radius.sm, padding: 4, marginHorizontal: -4 },
  transcriptTextActive: { color: Colors.primary, fontWeight: '600' },
  tapToHear: { fontSize: FontSize.xs },
  revealBtn: { flex: 1, backgroundColor: '#F3F4F6', borderRadius: Radius.sm, padding: 10 },
  revealText: { fontSize: FontSize.sm, color: Colors.textSecondary, textAlign: 'center' },

  quizBtn: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.md,
    padding: Spacing.md,
    alignItems: 'center',
  },
  quizBtnText: { color: '#fff', fontSize: FontSize.md, fontWeight: '700' },

  questionCard: {
    backgroundColor: Colors.card,
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  questionText: { fontSize: FontSize.md, fontWeight: '600', color: Colors.text, marginBottom: Spacing.sm },
  optionBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    padding: 12, borderRadius: Radius.sm,
    borderWidth: 1.5, borderColor: Colors.border, marginBottom: 8,
  },
  optionBtnSelected: { borderColor: Colors.primary, backgroundColor: '#EEF2FF' },
  optionDot: { width: 18, height: 18, borderRadius: 9, borderWidth: 2, borderColor: Colors.border },
  optionDotSelected: { borderColor: Colors.primary, backgroundColor: Colors.primary },
  optionText: { fontSize: FontSize.md, color: Colors.text },
  optionTextSelected: { color: Colors.primary, fontWeight: '600' },

  submitBtn: { backgroundColor: Colors.primary, borderRadius: Radius.md, padding: Spacing.md, alignItems: 'center' },
  submitBtnDisabled: { backgroundColor: Colors.border },
  submitBtnText: { color: '#fff', fontSize: FontSize.md, fontWeight: '700' },

  resultCard: {
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    padding: Spacing.xl,
    alignItems: 'center',
    marginTop: Spacing.lg,
    marginBottom: Spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  resultEmoji: { fontSize: 64, marginBottom: 12 },
  resultScore: { fontSize: FontSize.xxxl, fontWeight: '700', color: Colors.primary },
  resultPct: { fontSize: FontSize.xl, color: Colors.textSecondary, marginBottom: 12 },
  resultMsg: { fontSize: FontSize.md, color: Colors.text, textAlign: 'center', lineHeight: 22 },

  reviewCard: {
    backgroundColor: Colors.card,
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  reviewQ: { fontSize: FontSize.md, fontWeight: '600', color: Colors.text, marginBottom: 10 },
  reviewOpt: {
    flexDirection: 'row', justifyContent: 'space-between',
    padding: 10, borderRadius: Radius.sm,
    borderWidth: 1, borderColor: Colors.border, marginBottom: 6,
  },
  reviewOptCorrect: { backgroundColor: '#D1FAE5', borderColor: '#10B981' },
  reviewOptWrong: { backgroundColor: '#FEE2E2', borderColor: '#EF4444' },
  reviewOptText: { fontSize: FontSize.md, color: Colors.text },
  reviewMark: { color: '#10B981', fontWeight: '700' },
  reviewMarkWrong: { color: '#EF4444', fontWeight: '700' },

  doneBtn: { backgroundColor: Colors.primary, borderRadius: Radius.md, padding: Spacing.md, alignItems: 'center' },
  doneBtnText: { color: '#fff', fontSize: FontSize.md, fontWeight: '700' },
});
