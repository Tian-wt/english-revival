import React from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, SafeAreaView,
} from 'react-native';
import { Colors, Spacing, FontSize, Radius } from '../theme';
import { userProgress } from '../data/mockData';

const WEEK_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function ProfileScreen() {
  const { stats, recentActivity, badges } = userProgress;

  const activityColor = (type: string) => {
    if (type === 'speaking') return Colors.primary;
    if (type === 'listening') return Colors.secondary;
    if (type === 'pronunciation') return Colors.accent;
    return Colors.border;
  };

  const maxMinutes = Math.max(...recentActivity.map(a => a.minutes), 1);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>{userProgress.name[0]}</Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{userProgress.name}</Text>
            <View style={styles.levelBadge}>
              <Text style={styles.levelText}>{userProgress.level}</Text>
            </View>
          </View>
          <View style={styles.streakBadge}>
            <Text style={styles.streakFire}>🔥</Text>
            <Text style={styles.streakNum}>{userProgress.streak}</Text>
            <Text style={styles.streakLabel}>day streak</Text>
          </View>
        </View>

        {/* Summary Stats */}
        <View style={styles.summaryRow}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryNum}>{userProgress.totalMinutes}</Text>
            <Text style={styles.summaryLabel}>Total Minutes</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryNum}>{userProgress.weeklyCompleted}/{userProgress.weeklyGoal}</Text>
            <Text style={styles.summaryLabel}>This Week</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryNum}>{userProgress.streak}</Text>
            <Text style={styles.summaryLabel}>Day Streak</Text>
          </View>
        </View>

        {/* Skill Radar (simplified as bars) */}
        <Text style={styles.sectionTitle}>Skill Overview</Text>
        <View style={styles.skillsCard}>
          {[
            { label: 'Listening', score: stats.listeningScore, color: Colors.primary, icon: '🎧' },
            { label: 'Speaking', score: stats.speakingScore, color: Colors.secondary, icon: '💬' },
            { label: 'Pronunciation', score: stats.pronunciationScore, color: Colors.accent, icon: '🎤' },
            { label: 'Vocabulary', score: stats.vocabularyScore, color: '#7C3AED', icon: '📚' },
          ].map(skill => (
            <View key={skill.label} style={styles.skillRow}>
              <Text style={styles.skillIcon}>{skill.icon}</Text>
              <Text style={styles.skillLabel}>{skill.label}</Text>
              <View style={styles.skillBarBg}>
                <View style={[styles.skillBarFill, { width: `${skill.score}%`, backgroundColor: skill.color }]} />
              </View>
              <Text style={[styles.skillScore, { color: skill.color }]}>{skill.score}</Text>
            </View>
          ))}
        </View>

        {/* Weekly Activity Chart */}
        <Text style={styles.sectionTitle}>This Week's Activity</Text>
        <View style={styles.activityCard}>
          <View style={styles.chartRow}>
            {recentActivity.map((day, i) => (
              <View key={i} style={styles.chartBar}>
                <View style={styles.barContainer}>
                  <View style={[
                    styles.bar,
                    {
                      height: `${(day.minutes / maxMinutes) * 100}%`,
                      backgroundColor: activityColor(day.type),
                      opacity: day.minutes === 0 ? 0.2 : 1,
                    }
                  ]} />
                </View>
                <Text style={styles.barLabel}>{WEEK_DAYS[i]}</Text>
                <Text style={styles.barMinutes}>{day.minutes > 0 ? `${day.minutes}m` : '-'}</Text>
              </View>
            ))}
          </View>

          {/* Legend */}
          <View style={styles.legendRow}>
            {[
              { color: Colors.primary, label: 'Speaking' },
              { color: Colors.secondary, label: 'Listening' },
              { color: Colors.accent, label: 'Pronunciation' },
            ].map(item => (
              <View key={item.label} style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: item.color }]} />
                <Text style={styles.legendText}>{item.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Badges */}
        <Text style={styles.sectionTitle}>Achievements</Text>
        <View style={styles.badgesGrid}>
          {badges.map(badge => (
            <View key={badge.id} style={[styles.badgeCard, !badge.earned && styles.badgeCardLocked]}>
              <Text style={[styles.badgeIcon, !badge.earned && styles.badgeIconLocked]}>
                {badge.earned ? badge.icon : '🔒'}
              </Text>
              <Text style={[styles.badgeName, !badge.earned && styles.badgeNameLocked]}>
                {badge.name}
              </Text>
            </View>
          ))}
        </View>

        {/* Settings Section */}
        <Text style={styles.sectionTitle}>Settings</Text>
        <View style={styles.settingsCard}>
          {[
            { icon: '🎯', label: 'Daily Goal', value: '15 min/day' },
            { icon: '📅', label: 'Weekly Target', value: '5 days/week' },
            { icon: '🔔', label: 'Reminders', value: '9:00 AM' },
            { icon: '🌐', label: 'Accent Preference', value: 'American' },
          ].map((item, i) => (
            <TouchableOpacity key={i} style={[styles.settingRow, i > 0 && styles.settingRowBorder]}>
              <Text style={styles.settingIcon}>{item.icon}</Text>
              <Text style={styles.settingLabel}>{item.label}</Text>
              <View style={styles.settingRight}>
                <Text style={styles.settingValue}>{item.value}</Text>
                <Text style={styles.settingArrow}>›</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  scroll: { flex: 1, paddingHorizontal: Spacing.md },
  sectionTitle: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.sm,
    marginTop: Spacing.md,
  },

  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
    gap: Spacing.md,
  },
  avatarCircle: {
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: Colors.primary,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { fontSize: FontSize.xxl, fontWeight: '700', color: '#fff' },
  profileInfo: { flex: 1 },
  profileName: { fontSize: FontSize.xl, fontWeight: '700', color: Colors.text },
  levelBadge: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: Radius.full,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  levelText: { fontSize: FontSize.xs, color: Colors.primary, fontWeight: '600' },
  streakBadge: {
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    padding: 10,
    borderRadius: Radius.md,
  },
  streakFire: { fontSize: 24 },
  streakNum: { fontSize: FontSize.xl, fontWeight: '700', color: '#D97706' },
  streakLabel: { fontSize: FontSize.xs, color: '#92400E' },

  summaryRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.sm },
  summaryCard: {
    flex: 1,
    backgroundColor: Colors.card,
    borderRadius: Radius.md,
    padding: Spacing.md,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  summaryNum: { fontSize: FontSize.xl, fontWeight: '700', color: Colors.primary },
  summaryLabel: { fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 2, textAlign: 'center' },

  skillsCard: {
    backgroundColor: Colors.card,
    borderRadius: Radius.md,
    padding: Spacing.md,
    gap: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  skillRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  skillIcon: { fontSize: 18, width: 24 },
  skillLabel: { fontSize: FontSize.sm, color: Colors.text, width: 100 },
  skillBarBg: { flex: 1, height: 8, backgroundColor: Colors.border, borderRadius: 4 },
  skillBarFill: { height: 8, borderRadius: 4 },
  skillScore: { fontSize: FontSize.sm, fontWeight: '700', width: 28, textAlign: 'right' },

  activityCard: {
    backgroundColor: Colors.card,
    borderRadius: Radius.md,
    padding: Spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  chartRow: { flexDirection: 'row', justifyContent: 'space-between', height: 100, alignItems: 'flex-end', marginBottom: 8 },
  chartBar: { flex: 1, alignItems: 'center', gap: 4 },
  barContainer: { flex: 1, width: '60%', justifyContent: 'flex-end' },
  bar: { width: '100%', borderRadius: 3, minHeight: 4 },
  barLabel: { fontSize: FontSize.xs, color: Colors.textSecondary },
  barMinutes: { fontSize: 9, color: Colors.textLight },
  legendRow: { flexDirection: 'row', justifyContent: 'center', gap: Spacing.md, marginTop: 8 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontSize: FontSize.xs, color: Colors.textSecondary },

  badgesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  badgeCard: {
    width: '30%',
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
  badgeCardLocked: { opacity: 0.5 },
  badgeIcon: { fontSize: 28, marginBottom: 4 },
  badgeIconLocked: { opacity: 0.4 },
  badgeName: { fontSize: FontSize.xs, color: Colors.text, textAlign: 'center', fontWeight: '600' },
  badgeNameLocked: { color: Colors.textSecondary },

  settingsCard: {
    backgroundColor: Colors.card,
    borderRadius: Radius.md,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  settingRow: { flexDirection: 'row', alignItems: 'center', padding: Spacing.md, gap: 12 },
  settingRowBorder: { borderTopWidth: 1, borderTopColor: Colors.border },
  settingIcon: { fontSize: 20 },
  settingLabel: { flex: 1, fontSize: FontSize.md, color: Colors.text },
  settingRight: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  settingValue: { fontSize: FontSize.sm, color: Colors.textSecondary },
  settingArrow: { fontSize: 20, color: Colors.textLight },
});
