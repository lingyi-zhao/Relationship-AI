import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import ScreenWrapper from '../../components/ScreenWrapper';
import MyCard from '../../components/MyCard';
import { useAppStore } from '../../state/store';
import { theme } from '../../theme';

export default function GrowthScreen() {
    const { user, completedTasks, moodLogs, checkInHistory } = useAppStore();

    const getInsights = () => {
        // Simple deterministic mocks
        const insights = [
            "You value direct communication.",
            "You've been consistent with self-care lately.",
        ];
        if (completedTasks.length > 2) insights.push("You are taking action towards healing.");
        if (moodLogs.length > 0) insights.push(`You've tracked your mood ${moodLogs.length} times.`);
        return insights;
    };

    return (
        <ScreenWrapper>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                <View style={styles.header}>
                    <Text style={styles.title}>Me</Text>
                    <Text style={styles.subtitle}>Your personal growth dashboard.</Text>
                </View>

                <MyCard style={styles.profileCard} variant="elevated">
                    <View style={styles.profileContent}>
                        <View style={styles.avatar}>
                            <Text style={styles.avatarText}>{user?.name[0] || 'U'}</Text>
                        </View>
                        <View style={styles.profileInfo}>
                            <Text style={styles.userName}>{user?.name || 'User'}</Text>
                            <Text style={styles.userStatus}>
                                Currently in: <Text style={styles.bold}>{user?.status || 'exploring'}</Text> phase
                            </Text>
                        </View>
                    </View>
                </MyCard>

                <View style={styles.statsRow}>
                    <MyCard style={styles.statCard} variant="elevated">
                        <Text style={styles.statNumber}>{completedTasks.length}</Text>
                        <Text style={styles.statLabel}>Tasks Done</Text>
                    </MyCard>
                    <MyCard style={styles.statCard} variant="elevated">
                        <Text style={styles.statNumber}>{checkInHistory.length}</Text>
                        <Text style={styles.statLabel}>Check-ins</Text>
                    </MyCard>
                    <MyCard style={styles.statCard} variant="elevated">
                        <Text style={styles.statNumber}>{moodLogs.length}</Text>
                        <Text style={styles.statLabel}>Mood Logs</Text>
                    </MyCard>
                </View>

                <View style={styles.sectionHeaderContainer}>
                    <Text style={styles.sectionHeader}>Personal Insights</Text>
                </View>
                <MyCard style={styles.insightsContainer} variant="elevated">
                    {getInsights().map((insight, idx) => (
                        <View key={idx} style={styles.insightRow}>
                            <Text style={styles.bulletPoint}>•</Text>
                            <Text style={styles.insightText}>{insight}</Text>
                        </View>
                    ))}
                </MyCard>

                <View style={styles.sectionHeaderContainer}>
                    <Text style={styles.sectionHeader}>Goals</Text>
                </View>
                <MyCard variant="elevated">
                    <Text style={styles.emptyText}>Tap to set new goals (coming soon)</Text>
                </MyCard>

            </ScrollView>
        </ScreenWrapper>
    );
}

const styles = StyleSheet.create({
    scrollContent: {
        paddingBottom: theme.spacing.xxl,
    },
    header: { 
        marginBottom: theme.spacing.xl,
    },
    title: { 
        ...theme.typography.h1,
        color: theme.colors.text,
        fontWeight: '800',
    },
    subtitle: { 
        ...theme.typography.body,
        color: theme.colors.textLight, 
        marginTop: theme.spacing.xs,
    },
    profileCard: { 
        marginBottom: theme.spacing.xl,
        paddingVertical: theme.spacing.l,
        borderRadius: theme.borderRadius.l,
    },
    profileContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatar: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: theme.colors.primary + '15',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: theme.spacing.l,
        ...theme.shadows.soft,
    },
    avatarText: { 
        ...theme.typography.h2,
        color: theme.colors.primary,
        fontWeight: '800',
    },
    profileInfo: {
        flex: 1,
    },
    userName: { 
        ...theme.typography.h2,
        color: theme.colors.text,
        fontWeight: '800',
        marginBottom: theme.spacing.xs,
    },
    userStatus: { 
        ...theme.typography.caption,
        color: theme.colors.textLight,
    },
    bold: { 
        fontWeight: '700', 
        color: theme.colors.primary,
        textTransform: 'capitalize',
    },

    statsRow: { 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        marginBottom: theme.spacing.xl,
        gap: theme.spacing.s,
    },
    statCard: { 
        flex: 1, 
        alignItems: 'center', 
        paddingVertical: theme.spacing.l,
        borderRadius: theme.borderRadius.l,
        minWidth: 0, // Allow flex to work properly
    },
    statNumber: { 
        ...theme.typography.h2,
        color: theme.colors.primary, 
        fontWeight: '800',
        marginBottom: theme.spacing.xs,
    },
    statLabel: { 
        ...theme.typography.caption,
        color: theme.colors.textLight,
        fontWeight: '600',
    },

    sectionHeaderContainer: {
        marginBottom: theme.spacing.m,
        marginTop: theme.spacing.s,
    },
    sectionHeader: { 
        ...theme.typography.h2,
        color: theme.colors.text, 
        fontWeight: '800',
    },
    insightsContainer: { 
        marginBottom: theme.spacing.xl,
        borderRadius: theme.borderRadius.l,
    },
    insightRow: { 
        flexDirection: 'row', 
        marginBottom: theme.spacing.m,
        alignItems: 'flex-start',
    },
    bulletPoint: { 
        fontSize: 20, 
        color: theme.colors.primary, 
        marginRight: theme.spacing.m, 
        marginTop: -2,
        fontWeight: '700',
    },
    insightText: { 
        ...theme.typography.body,
        color: theme.colors.text,
        flex: 1, 
        lineHeight: 24,
    },
    emptyText: { 
        ...theme.typography.body,
        color: theme.colors.textLight, 
        fontStyle: 'italic', 
        textAlign: 'center', 
        padding: theme.spacing.l,
    },
});
