import React, { useState, useRef, useEffect } from 'react';
import { 
    View, Text, StyleSheet, TouchableOpacity, Animated, 
    Dimensions, ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../theme';
import { useAppStore } from '../state/store';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface EmotionLog {
    id: string;
    date: string;
    color: string;
    emotions: string[];
    intensity: number;
}

const EMOTION_ZONES = [
    { id: 'angry', color: '#FF6B6B', gradient: ['#FF6B6B', '#E55555'] as [string, string], emotions: ['Angry', 'Frustrated', 'Irritated'], icon: '😤' },
    { id: 'anxious', color: '#FF9F43', gradient: ['#FF9F43', '#E58B3A'] as [string, string], emotions: ['Anxious', 'Worried', 'Stressed'], icon: '😰' },
    { id: 'happy', color: '#FECA57', gradient: ['#FECA57', '#E5B54E'] as [string, string], emotions: ['Happy', 'Joyful', 'Excited'], icon: '😊' },
    { id: 'calm', color: '#48DBFB', gradient: ['#48DBFB', '#3BC4E0'] as [string, string], emotions: ['Calm', 'Peaceful', 'Content'], icon: '😌' },
    { id: 'sad', color: '#74B9FF', gradient: ['#74B9FF', '#5A9FE5'] as [string, string], emotions: ['Sad', 'Melancholy', 'Blue'], icon: '😢' },
    { id: 'lonely', color: '#A29BFE', gradient: ['#A29BFE', '#8B84E5'] as [string, string], emotions: ['Lonely', 'Isolated', 'Empty'], icon: '😔' },
    { id: 'hopeful', color: '#55EFC4', gradient: ['#55EFC4', '#48D6AF'] as [string, string], emotions: ['Hopeful', 'Optimistic', 'Inspired'], icon: '🌟' },
    { id: 'loving', color: '#FF85C0', gradient: ['#FF85C0', '#E573AB'] as [string, string], emotions: ['Loving', 'Grateful', 'Connected'], icon: '💗' },
];

const INTENSITY_LEVELS = [
    { value: 0.25, label: 'Subtle', description: 'Barely there' },
    { value: 0.5, label: 'Mild', description: 'Noticeable' },
    { value: 0.75, label: 'Strong', description: 'Quite intense' },
    { value: 1.0, label: 'Intense', description: 'Overwhelming' },
];

export const EmotionColorWheel: React.FC = () => {
    const { logMood } = useAppStore();
    const [selectedZone, setSelectedZone] = useState<typeof EMOTION_ZONES[0] | null>(null);
    const [intensity, setIntensity] = useState(0.5);
    const [recentLogs, setRecentLogs] = useState<EmotionLog[]>([]);
    const [showSaved, setShowSaved] = useState(false);
    
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const pulseAnim = useRef(new Animated.Value(1)).current;
    const saveAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
    }, []);

    const handleZonePress = (zone: typeof EMOTION_ZONES[0]) => {
        setSelectedZone(zone);
        
        Animated.sequence([
            Animated.timing(pulseAnim, { toValue: 1.15, duration: 150, useNativeDriver: true }),
            Animated.timing(pulseAnim, { toValue: 1, duration: 150, useNativeDriver: true }),
        ]).start();
    };

    const saveEmotion = () => {
        if (!selectedZone) return;
        
        const moodValue = Math.ceil(intensity * 4) + 1;
        
        logMood({
            id: 'mood_' + Date.now(),
            date: new Date().toISOString(),
            value: Math.min(5, Math.max(1, moodValue)) as 1 | 2 | 3 | 4 | 5,
            note: selectedZone.emotions.join(', '),
        });
        
        const newLog: EmotionLog = {
            id: 'elog_' + Date.now(),
            date: new Date().toISOString(),
            color: selectedZone.color,
            emotions: selectedZone.emotions,
            intensity,
        };
        
        setRecentLogs(prev => [newLog, ...prev].slice(0, 7));
        
        // Save animation
        setShowSaved(true);
        Animated.sequence([
            Animated.timing(saveAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
            Animated.delay(1200),
            Animated.timing(saveAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
        ]).start(() => {
            setShowSaved(false);
            setSelectedZone(null);
        });
    };

    return (
        <Animated.ScrollView 
            style={[styles.container, { opacity: fadeAnim }]} 
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
        >
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerIcon}>
                    <Text style={{ fontSize: 28 }}>🎨</Text>
                </View>
                <Text style={styles.title}>Emotion Color Wheel</Text>
                <Text style={styles.subtitle}>Tap a color that matches how you feel</Text>
            </View>
            
            {/* Emotion Grid */}
            <View style={styles.emotionGrid}>
                {EMOTION_ZONES.map((zone) => (
                    <TouchableOpacity
                        key={zone.id}
                        style={[
                            styles.emotionCard,
                            selectedZone?.id === zone.id && styles.emotionCardSelected
                        ]}
                        onPress={() => handleZonePress(zone)}
                        activeOpacity={0.8}
                    >
                        <Animated.View style={[
                            styles.emotionCardInner,
                            selectedZone?.id === zone.id && { transform: [{ scale: pulseAnim }] }
                        ]}>
                            <LinearGradient colors={zone.gradient} style={styles.emotionGradient}>
                                <Text style={styles.emotionEmoji}>{zone.icon}</Text>
                                <Text style={styles.emotionLabel}>{zone.emotions[0]}</Text>
                            </LinearGradient>
                        </Animated.View>
                        {selectedZone?.id === zone.id && (
                            <View style={styles.checkBadge}>
                                <Ionicons name="checkmark" size={14} color="#FFF" />
                            </View>
                        )}
                    </TouchableOpacity>
                ))}
            </View>
            
            {/* Selected Emotion Display */}
            {selectedZone && (
                <Animated.View style={styles.selectionPanel}>
                    <View style={styles.selectionHeader}>
                        <View style={[styles.selectionColorDot, { backgroundColor: selectedZone.color }]} />
                        <View style={styles.selectionInfo}>
                            <Text style={styles.selectionTitle}>You're feeling...</Text>
                            <View style={styles.emotionTagsRow}>
                                {selectedZone.emotions.map((emotion, i) => (
                                    <View key={i} style={[styles.emotionTag, { backgroundColor: selectedZone.color + '20' }]}>
                                        <Text style={[styles.emotionTagText, { color: selectedZone.color }]}>{emotion}</Text>
                                    </View>
                                ))}
                            </View>
                        </View>
                    </View>
                    
                    {/* Intensity Selector */}
                    <View style={styles.intensitySection}>
                        <Text style={styles.intensityTitle}>How intense is this feeling?</Text>
                        <View style={styles.intensityOptions}>
                            {INTENSITY_LEVELS.map((level) => (
                                <TouchableOpacity
                                    key={level.value}
                                    style={[
                                        styles.intensityOption,
                                        intensity === level.value && styles.intensityOptionActive,
                                        intensity === level.value && { borderColor: selectedZone.color }
                                    ]}
                                    onPress={() => setIntensity(level.value)}
                                >
                                    <View style={[
                                        styles.intensityDot,
                                        { 
                                            backgroundColor: intensity === level.value ? selectedZone.color : theme.colors.border,
                                            width: 8 + level.value * 16,
                                            height: 8 + level.value * 16,
                                            borderRadius: (8 + level.value * 16) / 2
                                        }
                                    ]} />
                                    <Text style={[
                                        styles.intensityLabel,
                                        intensity === level.value && { color: selectedZone.color, fontWeight: '700' as const }
                                    ]}>{level.label}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                    
                    {/* Save Button */}
                    <TouchableOpacity style={styles.saveButton} onPress={saveEmotion} activeOpacity={0.9}>
                        <LinearGradient colors={selectedZone.gradient} style={styles.saveButtonGradient}>
                            <Ionicons name="checkmark-circle" size={22} color="#FFF" />
                            <Text style={styles.saveButtonText}>Log This Feeling</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </Animated.View>
            )}
            
            {/* Saved Confirmation */}
            {showSaved && (
                <Animated.View style={[styles.savedBanner, { opacity: saveAnim, transform: [{ scale: saveAnim }] }]}>
                    <LinearGradient colors={[theme.colors.success, '#48D6AF']} style={styles.savedBannerGradient}>
                        <Ionicons name="checkmark-circle" size={24} color="#FFF" />
                        <Text style={styles.savedText}>Emotion logged!</Text>
                    </LinearGradient>
                </Animated.View>
            )}
            
            {/* Recent Emotion Art */}
            {recentLogs.length > 0 && (
                <View style={styles.recentSection}>
                    <View style={styles.recentHeader}>
                        <Text style={styles.recentTitle}>Your Emotion Palette</Text>
                        <Text style={styles.recentSubtitle}>This week's emotional journey</Text>
                    </View>
                    
                    <View style={styles.emotionArtContainer}>
                        <View style={styles.emotionArt}>
                            {recentLogs.map((log, i) => {
                                const baseSize = 35;
                                const size = baseSize + log.intensity * 30;
                                const row = Math.floor(i / 4);
                                const col = i % 4;
                                
                                return (
                                    <View
                                        key={log.id}
                                        style={[styles.emotionBubble, {
                                            backgroundColor: log.color,
                                            width: size,
                                            height: size,
                                            borderRadius: size / 2,
                                            left: 15 + col * 75,
                                            top: 10 + row * 70,
                                            opacity: 0.85,
                                        }]}
                                    />
                                );
                            })}
                        </View>
                    </View>
                    
                    {/* Legend */}
                    <View style={styles.legendContainer}>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.legendScroll}>
                            {EMOTION_ZONES.slice(0, 6).map(zone => (
                                <View key={zone.id} style={styles.legendItem}>
                                    <View style={[styles.legendDot, { backgroundColor: zone.color }]} />
                                    <Text style={styles.legendText}>{zone.emotions[0]}</Text>
                                </View>
                            ))}
                        </ScrollView>
                    </View>
                </View>
            )}
            
            {/* Info Card */}
            <View style={styles.infoCard}>
                <View style={styles.infoIconContainer}>
                    <Ionicons name="information-circle" size={20} color={theme.colors.secondary} />
                </View>
                <Text style={styles.infoText}>
                    Tracking your emotions helps you understand patterns and triggers. 
                    There are no "wrong" feelings — all emotions are valid.
                </Text>
            </View>
            
            <View style={{ height: 100 }} />
        </Animated.ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    scrollContent: { paddingBottom: 40 },
    
    // Header
    header: { alignItems: 'center', marginBottom: theme.spacing.xl, paddingTop: theme.spacing.m },
    headerIcon: { 
        width: 64, height: 64, borderRadius: 32, 
        backgroundColor: theme.colors.accent + '20', 
        justifyContent: 'center', alignItems: 'center', 
        marginBottom: theme.spacing.m 
    },
    title: { 
        fontSize: 26, fontWeight: '800' as const, color: theme.colors.text, 
        letterSpacing: -0.5, marginBottom: theme.spacing.xs 
    },
    subtitle: { fontSize: 16, color: theme.colors.textLight, textAlign: 'center' },
    
    // Emotion Grid
    emotionGrid: { 
        flexDirection: 'row', flexWrap: 'wrap', 
        gap: theme.spacing.m, justifyContent: 'center',
        marginBottom: theme.spacing.l
    },
    emotionCard: { 
        width: (SCREEN_WIDTH - 64) / 2 - 8, 
        borderRadius: theme.borderRadius.xl, 
        overflow: 'hidden',
        borderWidth: 3, borderColor: 'transparent',
        ...theme.shadows.card 
    },
    emotionCardSelected: { 
        borderColor: theme.colors.text,
        transform: [{ scale: 1.02 }]
    },
    emotionCardInner: {},
    emotionGradient: { 
        paddingVertical: theme.spacing.l, 
        alignItems: 'center', justifyContent: 'center' 
    },
    emotionEmoji: { fontSize: 32, marginBottom: theme.spacing.s },
    emotionLabel: { fontSize: 15, fontWeight: '700' as const, color: '#FFF', textShadowColor: 'rgba(0,0,0,0.2)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 2 },
    checkBadge: { 
        position: 'absolute', top: 8, right: 8, 
        width: 24, height: 24, borderRadius: 12, 
        backgroundColor: theme.colors.text, 
        justifyContent: 'center', alignItems: 'center' 
    },
    
    // Selection Panel
    selectionPanel: { 
        backgroundColor: theme.colors.card, 
        borderRadius: theme.borderRadius.xl, 
        padding: theme.spacing.l, 
        marginBottom: theme.spacing.l,
        ...theme.shadows.card 
    },
    selectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: theme.spacing.l },
    selectionColorDot: { width: 52, height: 52, borderRadius: 26, marginRight: theme.spacing.m, ...theme.shadows.soft },
    selectionInfo: { flex: 1 },
    selectionTitle: { fontSize: 14, color: theme.colors.textLight, marginBottom: theme.spacing.xs },
    emotionTagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.xs },
    emotionTag: { paddingHorizontal: theme.spacing.s, paddingVertical: 6, borderRadius: theme.borderRadius.s },
    emotionTagText: { fontSize: 13, fontWeight: '600' as const },
    
    // Intensity Section
    intensitySection: { marginBottom: theme.spacing.l },
    intensityTitle: { fontSize: 15, fontWeight: '600' as const, color: theme.colors.text, marginBottom: theme.spacing.m },
    intensityOptions: { flexDirection: 'row', gap: theme.spacing.s },
    intensityOption: { 
        flex: 1, alignItems: 'center', paddingVertical: theme.spacing.m, 
        backgroundColor: theme.colors.background, borderRadius: theme.borderRadius.l,
        borderWidth: 2, borderColor: 'transparent'
    },
    intensityOptionActive: { backgroundColor: '#FFF' },
    intensityDot: { marginBottom: theme.spacing.xs },
    intensityLabel: { fontSize: 12, color: theme.colors.textLight, fontWeight: '500' as const },
    
    // Save Button
    saveButton: { borderRadius: theme.borderRadius.l, overflow: 'hidden', ...theme.shadows.medium },
    saveButtonGradient: { 
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center', 
        gap: theme.spacing.s, paddingVertical: theme.spacing.m 
    },
    saveButtonText: { fontSize: 17, fontWeight: '700' as const, color: '#FFF' },
    
    // Saved Banner
    savedBanner: { 
        position: 'absolute', top: 100, left: theme.spacing.l, right: theme.spacing.l,
        borderRadius: theme.borderRadius.l, overflow: 'hidden', 
        ...theme.shadows.large, zIndex: 100
    },
    savedBannerGradient: { 
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center', 
        gap: theme.spacing.s, paddingVertical: theme.spacing.m 
    },
    savedText: { fontSize: 17, fontWeight: '700' as const, color: '#FFF' },
    
    // Recent Section
    recentSection: { 
        backgroundColor: theme.colors.card, 
        borderRadius: theme.borderRadius.xl, 
        padding: theme.spacing.l, 
        marginBottom: theme.spacing.l,
        ...theme.shadows.card 
    },
    recentHeader: { marginBottom: theme.spacing.m },
    recentTitle: { fontSize: 18, fontWeight: '700' as const, color: theme.colors.text },
    recentSubtitle: { fontSize: 14, color: theme.colors.textLight, marginTop: 4 },
    
    emotionArtContainer: { 
        backgroundColor: theme.colors.background, 
        borderRadius: theme.borderRadius.l, 
        overflow: 'hidden',
        marginBottom: theme.spacing.m
    },
    emotionArt: { height: 160, position: 'relative' },
    emotionBubble: { position: 'absolute', ...theme.shadows.soft },
    
    legendContainer: { marginTop: theme.spacing.xs },
    legendScroll: { gap: theme.spacing.m, paddingVertical: theme.spacing.xs },
    legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    legendDot: { width: 12, height: 12, borderRadius: 6 },
    legendText: { fontSize: 12, color: theme.colors.textLight, fontWeight: '500' as const },
    
    // Info Card
    infoCard: { 
        flexDirection: 'row', alignItems: 'flex-start', gap: theme.spacing.m,
        backgroundColor: theme.colors.secondary + '08', 
        padding: theme.spacing.l, borderRadius: theme.borderRadius.xl 
    },
    infoIconContainer: { 
        width: 36, height: 36, borderRadius: 18, 
        backgroundColor: theme.colors.secondary + '15', 
        justifyContent: 'center', alignItems: 'center' 
    },
    infoText: { flex: 1, fontSize: 14, color: theme.colors.text, lineHeight: 22 },
});

export default EmotionColorWheel;
