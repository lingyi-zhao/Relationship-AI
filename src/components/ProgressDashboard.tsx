import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Dimensions, ScrollView } from 'react-native';
import { LineChart, BarChart, ProgressChart } from 'react-native-chart-kit';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../theme';
import { useAppStore } from '../state/store';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CHART_WIDTH = SCREEN_WIDTH - 48;

interface ProgressDashboardProps { compact?: boolean; }

export const ProgressDashboard: React.FC<ProgressDashboardProps> = ({ compact = false }) => {
    const { moodLogs, voiceJournals, healedMemories, completedTasks } = useAppStore();

    const streak = useMemo(() => {
        if (moodLogs.length === 0) return 0;
        let count = 0;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        for (let i = 0; i < 365; i++) {
            const checkDate = new Date(today);
            checkDate.setDate(checkDate.getDate() - i);
            const dateStr = checkDate.toISOString().split('T')[0];
            const hasEntry = moodLogs.some(log => log.date.split('T')[0] === dateStr);
            if (hasEntry) { count++; } else if (i > 0) { break; }
        }
        return count;
    }, [moodLogs]);

    const moodChartData = useMemo(() => {
        const last7Days: number[] = [];
        const labels: string[] = [];
        const today = new Date();
        for (let i = 6; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            const dayLog = moodLogs.find(log => log.date.split('T')[0] === dateStr);
            last7Days.push(dayLog ? dayLog.value : 0);
            labels.push(date.toLocaleDateString('en-US', { weekday: 'short' }).charAt(0));
        }
        return { data: last7Days, labels };
    }, [moodLogs]);

    const avgMood = useMemo(() => {
        if (moodLogs.length === 0) return 0;
        const sum = moodLogs.slice(0, 7).reduce((acc, log) => acc + log.value, 0);
        return (sum / Math.min(moodLogs.length, 7)).toFixed(1);
    }, [moodLogs]);

    const milestones = useMemo(() => {
        const list: Array<{ icon: string; text: string; achieved: boolean }> = [];
        if (moodLogs.length >= 1) list.push({ icon: 'checkmark-circle', text: 'First mood logged!', achieved: true });
        if (moodLogs.length >= 7) list.push({ icon: 'calendar', text: '7 days of tracking', achieved: true });
        if (voiceJournals?.length >= 1) list.push({ icon: 'journal', text: 'First journal entry', achieved: true });
        if (healedMemories?.length >= 1) list.push({ icon: 'heart', text: 'First memory healed', achieved: true });
        if (moodLogs.length < 7) list.push({ icon: 'calendar-outline', text: (7 - moodLogs.length) + ' more days to streak', achieved: false });
        return list.slice(0, 4);
    }, [moodLogs, voiceJournals, healedMemories]);

    const chartConfig = {
        backgroundColor: theme.colors.card,
        backgroundGradientFrom: theme.colors.card,
        backgroundGradientTo: theme.colors.card,
        decimalPlaces: 0,
        color: (opacity = 1) => 'rgba(78, 205, 196, ' + opacity + ')',
        labelColor: () => theme.colors.textLight,
        propsForDots: { r: '6', strokeWidth: '2', stroke: theme.colors.secondary },
        propsForBackgroundLines: { stroke: theme.colors.border, strokeWidth: 1 },
    };

    if (compact) {
        return (
            <View style={styles.compactContainer}>
                <View style={styles.streakBadge}>
                    <Ionicons name="flame" size={24} color={theme.colors.accent} />
                    <Text style={styles.streakNumber}>{streak}</Text>
                    <Text style={styles.streakLabel}>day streak</Text>
                </View>
                <View style={styles.quickStats}>
                    <View style={styles.quickStat}><Text style={styles.quickStatNumber}>{moodLogs.length}</Text><Text style={styles.quickStatLabel}>Moods</Text></View>
                    <View style={styles.quickStat}><Text style={styles.quickStatNumber}>{voiceJournals?.length || 0}</Text><Text style={styles.quickStatLabel}>Journals</Text></View>
                </View>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            <View style={styles.headerStats}>
                <View style={styles.streakCard}>
                    <Ionicons name="flame" size={32} color={theme.colors.accent} />
                    <Text style={styles.streakBigNumber}>{streak}</Text>
                    <Text style={styles.streakBigLabel}>Day Streak</Text>
                </View>
                <View style={styles.avgMoodCard}>
                    <Ionicons name="happy" size={32} color={theme.colors.success} />
                    <Text style={styles.avgMoodNumber}>{avgMood}</Text>
                    <Text style={styles.avgMoodLabel}>Avg Mood</Text>
                </View>
                <View style={styles.totalCard}>
                    <Ionicons name="document-text" size={32} color={theme.colors.primary} />
                    <Text style={styles.totalNumber}>{voiceJournals?.length || 0}</Text>
                    <Text style={styles.totalLabel}>Entries</Text>
                </View>
            </View>

            <View style={styles.chartCard}>
                <Text style={styles.chartTitle}>Mood Trend (Last 7 Days)</Text>
                <Text style={styles.chartSubtitle}>Your emotional journey this week</Text>
                {moodLogs.length > 0 ? (
                    <LineChart
                        data={{ labels: moodChartData.labels, datasets: [{ data: moodChartData.data.map(d => d || 0.1) }] }}
                        width={CHART_WIDTH} height={180} chartConfig={chartConfig} bezier style={styles.chart}
                        withInnerLines withOuterLines={false} withVerticalLines={false} withHorizontalLines fromZero yAxisSuffix="" yAxisInterval={1}
                    />
                ) : (
                    <View style={styles.emptyChart}>
                        <Ionicons name="analytics-outline" size={48} color={theme.colors.textLight} />
                        <Text style={styles.emptyChartText}>Start logging moods to see your trend</Text>
                    </View>
                )}
            </View>

            <View style={styles.chartCard}>
                <Text style={styles.chartTitle}>Weekly Activity</Text>
                <BarChart
                    data={{ labels: ['Mood', 'Journal', 'Memory', 'Tasks'], datasets: [{ data: [Math.min(moodLogs.length, 7), Math.min(voiceJournals?.length || 0, 7), Math.min(healedMemories?.length || 0, 7), Math.min(completedTasks?.length || 0, 7)] }] }}
                    width={CHART_WIDTH} height={160} chartConfig={{ ...chartConfig, color: (o = 1) => 'rgba(255, 107, 107, ' + o + ')' }}
                    style={styles.chart} showValuesOnTopOfBars withInnerLines={false} fromZero yAxisLabel="" yAxisSuffix=""
                />
            </View>

            <View style={styles.milestonesCard}>
                <Text style={styles.chartTitle}>Milestones</Text>
                <View style={styles.milestonesList}>
                    {milestones.map((m, i) => (
                        <View key={i} style={[styles.milestoneItem, !m.achieved && styles.milestoneItemPending]}>
                            <View style={[styles.milestoneIcon, m.achieved && styles.milestoneIconAchieved]}>
                                <Ionicons name={m.icon as any} size={20} color={m.achieved ? '#FFF' : theme.colors.textLight} />
                            </View>
                            <Text style={[styles.milestoneText, !m.achieved && styles.milestoneTextPending]}>{m.text}</Text>
                            {m.achieved && <Ionicons name="checkmark-circle" size={20} color={theme.colors.success} />}
                        </View>
                    ))}
                </View>
            </View>
            <View style={{ height: 40 }} />
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    compactContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: theme.spacing.m, backgroundColor: theme.colors.card, borderRadius: theme.borderRadius.l, ...theme.shadows.soft },
    streakBadge: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    streakNumber: { fontSize: 22, color: theme.colors.accent, fontWeight: '800' as const },
    streakLabel: { fontSize: 12, color: theme.colors.textLight },
    quickStats: { flexDirection: 'row', gap: theme.spacing.l },
    quickStat: { alignItems: 'center' },
    quickStatNumber: { fontSize: 18, color: theme.colors.text, fontWeight: '700' as const },
    quickStatLabel: { fontSize: 10, color: theme.colors.textLight },
    headerStats: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: theme.spacing.l, gap: theme.spacing.m },
    streakCard: { flex: 1, backgroundColor: theme.colors.card, borderRadius: theme.borderRadius.l, padding: theme.spacing.m, alignItems: 'center', ...theme.shadows.card },
    streakBigNumber: { fontSize: 36, color: theme.colors.accent, fontWeight: '900' as const, marginTop: theme.spacing.xs },
    streakBigLabel: { fontSize: 10, color: theme.colors.textLight, textTransform: 'uppercase' },
    avgMoodCard: { flex: 1, backgroundColor: theme.colors.card, borderRadius: theme.borderRadius.l, padding: theme.spacing.m, alignItems: 'center', ...theme.shadows.card },
    avgMoodNumber: { fontSize: 36, color: theme.colors.success, fontWeight: '900' as const, marginTop: theme.spacing.xs },
    avgMoodLabel: { fontSize: 10, color: theme.colors.textLight, textTransform: 'uppercase' },
    totalCard: { flex: 1, backgroundColor: theme.colors.card, borderRadius: theme.borderRadius.l, padding: theme.spacing.m, alignItems: 'center', ...theme.shadows.card },
    totalNumber: { fontSize: 36, color: theme.colors.primary, fontWeight: '900' as const, marginTop: theme.spacing.xs },
    totalLabel: { fontSize: 10, color: theme.colors.textLight, textTransform: 'uppercase' },
    chartCard: { backgroundColor: theme.colors.card, borderRadius: theme.borderRadius.xl, padding: theme.spacing.l, marginBottom: theme.spacing.l, ...theme.shadows.card },
    chartTitle: { fontSize: 18, color: theme.colors.text, fontWeight: '700' as const, marginBottom: theme.spacing.xs },
    chartSubtitle: { fontSize: 14, color: theme.colors.textLight, marginBottom: theme.spacing.m },
    chart: { borderRadius: theme.borderRadius.m, marginLeft: -16 },
    emptyChart: { alignItems: 'center', justifyContent: 'center', paddingVertical: theme.spacing.xxl },
    emptyChartText: { fontSize: 16, color: theme.colors.textLight, marginTop: theme.spacing.m, textAlign: 'center' },
    milestonesCard: { backgroundColor: theme.colors.card, borderRadius: theme.borderRadius.xl, padding: theme.spacing.l, ...theme.shadows.card },
    milestonesList: { gap: theme.spacing.m },
    milestoneItem: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.m, padding: theme.spacing.m, backgroundColor: theme.colors.background, borderRadius: theme.borderRadius.m },
    milestoneItemPending: { opacity: 0.6 },
    milestoneIcon: { width: 36, height: 36, borderRadius: 18, backgroundColor: theme.colors.border, justifyContent: 'center', alignItems: 'center' },
    milestoneIconAchieved: { backgroundColor: theme.colors.success },
    milestoneText: { fontSize: 16, color: theme.colors.text, flex: 1, fontWeight: '600' as const },
    milestoneTextPending: { color: theme.colors.textLight, fontWeight: '400' as const },
});

export default ProgressDashboard;
