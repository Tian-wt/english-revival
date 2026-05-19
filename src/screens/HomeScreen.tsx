import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, SafeAreaView, StatusBar,
} from 'react-native';
import { Colors, Spacing, FontSize, Radius } from '../theme';
import { dailyTasks, userProgress } from '../data/mockData';

const DAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

export default function HomeScreen({ navigation }: any) {
  const [tasks, setTasks] = useState(dailyTasks);
  const completedCount = tasks.filter(t => t.completed).length;
  const totalMinutes = tasks.reduce((sum, t) => sum + t.duration, 0);
  const completedMinutes = tasks.filter(t => t.completed).reduce((sum, t) => sum + t.duration, 0);

  const handleTaskPress = (task: typeof dailyTasks[0]) => {
    if (task.type === 'listening') navigation.navigate('Listening');
    else if (task.type === 'speaking') navigation.navigate('Speaking');
    else if (task.type === 'pronunciation') navigation.navigate('Pronunciation');
  };

  const toggleTask = (id: string) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Good morning 👋</Text>
            <Text style={styles.name}>{userProgress.name}</Text>
          </View>
          <View style={styles.streakBadge}>
            <Text style={styles.streakFire}>🔥</Text>
            <Text style={styles.streakNum}>{userProgress.streak}</Text>
          </View>
        </View>

        {/* Daily Progress Card */}
        <View style={styles.progressCard}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressTitle}>Today's Plan</Text>
            <Text style={styles.progressSub}>{completedCount}/{tasks.length} done</Text>
          </View>

          {/* Progress Bar */}
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: `${(completedMinutes / totalMinutes) * 100}%` }]} />
          </View>
          <Text style={styles.progressMinutes}>{completedMinutes} / {totalMinutes} min</Text>

          {/* Weekly Dots */}
          <View style={styles.weekRow}>
            {DAYS.map((d, i) => (
              <View key={i} style={styles.dayItem}>
                <View style={[
                  styles.dayDot,
                  i < userProgress.weeklyCompleted && styles.dayDotFilled,
                  i === userProgress.weeklyCompleted && styles.dayDotToday,
                ]} />
                <Text style={styles.dayLabel}>{d}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Task List */}
        <Text style={styles.sectionTitle}>Today's Tasks</Text>
        {tasks.map(task => (
          <TouchableOpacity
            key={task.id}
            style={[styles.taskCard, task.completed && styles.taskCardDone]}
            onPress={() => handleTaskPress(task)}
            activeOpacity={0.8}
          >
            <View style={styles.taskLeft}>
              <Text style={styles.taskIcon}>{task.icon}</Text>
              <View style={styles.taskInfo}>
                <Text style={[styles.taskTitle, task.completed && styles.taskTitleDone]}>
                  {task.title}
                </Text>
                <Text style={styles.taskSubtitle}>{task.subtitle}</Text>
              </View>
            </View>
            <View style={styles.taskRight}>
              <Text style={styles.taskDuration}>{task.duration} min</Text>
              <TouchableOpacity
                style={[styles.checkBtn, task.completed && styles.checkBtnDone]}
                onPress={() => toggleTask(task.id)}
              >
                {task.completed && <Text style={styles.checkMark}>✓</Text>}
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        ))}

        {/* Quick Stats */}
        <Text style={styles.sectionTitle}>Your Progress</Text>
        <View style={styles.statsRow}>
          {[
            { label: 'Listening', score: userProgress.stats.listeningScore, color: '#4F46E5', icon: '🎧' },
            { label: 'Speaking', score: userProgress.stats.speakingScore, color: '#10B981', icon: '💬' },
            { label: 'Pronunciation', score: userProgress.stats.pronunciationScore, color: '#F59E0B', icon: '🎤' },
            { label: 'Vocabulary', score: userProgress.stats.vocabularyScore, color: '#EF4444', icon: '📚' },
          ].map(stat => (
            <View key={stat.label} style={styles.statCard}>
              <Text style={styles.statIcon}>{stat.icon}</Text>
              <Text style={[styles.statScore, { color: stat.color }]}>{stat.score}</Text>
              <View style={styles.statBarBg}>
                <View style={[styles.statBarFill, { width: `${stat.score}%`, backgroundColor: stat.color }]} />
              </View>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* Motivational Quote */}
        <View style={styles.quoteCard}>
          <Text style={styles.quoteText}>
            "The limits of my language mean the limits of my world."
          </Text>
          <Text style={styles.quoteAuthor}>— Ludwig Wittgenstein</Text>
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  scroll: { flex: 1, paddingHorizontal: Spacing.md },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  greeting: { fontSize: FontSize.md, color: Colors.textSecondary },
  name: { fontSize: FontSize.xxl, fontWeight: '700', color: Colors.text, marginTop: 2 },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Radius.full,
    gap: 4,
  },
  streakFire: { fontSize: 18 },
  streakNum: { fontSize: FontSize.lg, fontWeight: '700', color: '#D97706' },

  progressCard: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
  },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  progressTitle: { fontSize: FontSize.lg, fontWeight: '700', color: '#fff' },
  progressSub: { fontSize: FontSize.sm, color: 'rgba(255,255,255,0.7)' },
  progressBarBg: { height: 8, backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: 4, marginBottom: 6 },
  progressBarFill: { height: 8, backgroundColor: '#fff', borderRadius: 4 },
  progressMinutes: { fontSize: FontSize.sm, color: 'rgba(255,255,255,0.8)', marginBottom: 16 },
  weekRow: { flexDirection: 'row', justifyContent: 'space-between' },
  dayItem: { alignItems: 'center', gap: 4 },
  dayDot: { width: 28, height: 28, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.2)' },
  dayDotFilled: { backgroundColor: '#fff' },
  dayDotToday: { backgroundColor: Colors.accent, borderWidth: 2, borderColor: '#fff' },
  dayLabel: { fontSize: FontSize.xs, color: 'rgba(255,255,255,0.7)' },

  sectionTitle: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.sm,
    marginTop: Spacing.xs,
  },

  taskCard: {
    backgroundColor: Colors.card,
    borderRadius: Radius.md,
    padding: Spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  taskCardDone: { opacity: 0.6 },
  taskLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  taskIcon: { fontSize: 28 },
  taskInfo: { flex: 1 },
  taskTitle: { fontSize: FontSize.md, fontWeight: '600', color: Colors.text },
  taskTitleDone: { textDecorationLine: 'line-through', color: Colors.textSecondary },
  taskSubtitle: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 2 },
  taskRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  taskDuration: { fontSize: FontSize.sm, color: Colors.textSecondary },
  checkBtn: {
    width: 26, height: 26, borderRadius: 13,
    borderWidth: 2, borderColor: Colors.border,
    alignItems: 'center', justifyContent: 'center',
  },
  checkBtnDone: { backgroundColor: Colors.secondary, borderColor: Colors.secondary },
  checkMark: { color: '#fff', fontSize: 14, fontWeight: '700' },

  statsRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.lg },
  statCard: {
    flex: 1,
    backgroundColor: Colors.card,
    borderRadius: Radius.md,
    padding: Spacing.sm,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  statIcon: { fontSize: 20, marginBottom: 4 },
  statScore: { fontSize: FontSize.xl, fontWeight: '700' },
  statBarBg: { width: '100%', height: 4, backgroundColor: Colors.border, borderRadius: 2, marginVertical: 4 },
  statBarFill: { height: 4, borderRadius: 2 },
  statLabel: { fontSize: FontSize.xs, color: Colors.textSecondary, textAlign: 'center' },

  quoteCard: {
    backgroundColor: '#EEF2FF',
    borderRadius: Radius.md,
    padding: Spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
    marginBottom: Spacing.sm,
  },
  quoteText: { fontSize: FontSize.sm, color: Colors.text, fontStyle: 'italic', lineHeight: 22 },
  quoteAuthor: { fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 6, textAlign: 'right' },
});
