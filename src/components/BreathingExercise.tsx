import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Easing } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../theme';

type BreathingPhase = 'idle' | 'inhale' | 'hold' | 'exhale';

interface BreathingExerciseProps {
    compact?: boolean;
    onComplete?: () => void;
}

export const BreathingExercise: React.FC<BreathingExerciseProps> = ({ compact = false, onComplete }) => {
    const [isActive, setIsActive] = useState(false);
    const [phase, setPhase] = useState<BreathingPhase>('idle');
    const [cycleCount, setCycleCount] = useState(0);
    const [timeLeft, setTimeLeft] = useState(0);
    
    const scaleAnim = useRef(new Animated.Value(1)).current;
    const opacityAnim = useRef(new Animated.Value(0.3)).current;
    const pulseAnim = useRef(new Animated.Value(1)).current;
    
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const phaseRef = useRef<BreathingPhase>('idle');

    const INHALE_TIME = 4;
    const HOLD_TIME = 4;
    const EXHALE_TIME = 4;
    const TOTAL_CYCLES = 3;

    useEffect(() => {
        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, []);

    const startBreathing = () => {
        setIsActive(true);
        setCycleCount(0);
        runBreathingCycle();
    };

    const stopBreathing = () => {
        setIsActive(false);
        setPhase('idle');
        setCycleCount(0);
        if (timerRef.current) clearTimeout(timerRef.current);
        Animated.parallel([
            Animated.timing(scaleAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
            Animated.timing(opacityAnim, { toValue: 0.3, duration: 500, useNativeDriver: true }),
        ]).start();
    };

    const runBreathingCycle = () => {
        runPhase('inhale', INHALE_TIME, () => {
            runPhase('hold', HOLD_TIME, () => {
                runPhase('exhale', EXHALE_TIME, () => {
                    setCycleCount(prev => {
                        const newCount = prev + 1;
                        if (newCount >= TOTAL_CYCLES) {
                            setIsActive(false);
                            setPhase('idle');
                            onComplete?.();
                            return 0;
                        }
                        runBreathingCycle();
                        return newCount;
                    });
                });
            });
        });
    };

    const runPhase = (phaseName: BreathingPhase, duration: number, onEnd: () => void) => {
        setPhase(phaseName);
        phaseRef.current = phaseName;
        setTimeLeft(duration);

        if (phaseName === 'inhale') {
            Animated.parallel([
                Animated.timing(scaleAnim, { toValue: 1.5, duration: duration * 1000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
                Animated.timing(opacityAnim, { toValue: 0.8, duration: duration * 1000, useNativeDriver: true }),
            ]).start();
        } else if (phaseName === 'hold') {
            Animated.loop(
                Animated.sequence([
                    Animated.timing(pulseAnim, { toValue: 1.05, duration: 500, useNativeDriver: true }),
                    Animated.timing(pulseAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
                ]),
                { iterations: Math.floor(duration) }
            ).start();
        } else if (phaseName === 'exhale') {
            pulseAnim.setValue(1);
            Animated.parallel([
                Animated.timing(scaleAnim, { toValue: 1, duration: duration * 1000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
                Animated.timing(opacityAnim, { toValue: 0.3, duration: duration * 1000, useNativeDriver: true }),
            ]).start();
        }

        let remaining = duration;
        const countdown = () => {
            if (remaining > 0 && phaseRef.current === phaseName) {
                remaining -= 1;
                setTimeLeft(remaining);
                timerRef.current = setTimeout(countdown, 1000);
            }
        };
        timerRef.current = setTimeout(countdown, 1000);
        setTimeout(onEnd, duration * 1000);
    };

    const getPhaseText = () => {
        switch (phase) {
            case 'inhale': return 'Breathe In';
            case 'hold': return 'Hold';
            case 'exhale': return 'Breathe Out';
            default: return 'Ready';
        }
    };

    const getPhaseColor = () => {
        switch (phase) {
            case 'inhale': return theme.colors.secondary;
            case 'hold': return theme.colors.accent;
            case 'exhale': return theme.colors.primary;
            default: return theme.colors.textLight;
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Ionicons name="leaf" size={28} color={theme.colors.secondary} />
                <Text style={styles.title}>Breathing Exercise</Text>
            </View>
            <Text style={styles.subtitle}>
                {isActive ? 'Cycle ' + (cycleCount + 1) + ' of ' + TOTAL_CYCLES : 'Calm your mind with guided breathing'}
            </Text>

            <View style={styles.circleContainer}>
                <Animated.View 
                    style={[
                        styles.breathCircle,
                        { transform: [{ scale: Animated.multiply(scaleAnim, pulseAnim) }], opacity: opacityAnim, backgroundColor: getPhaseColor() }
                    ]}
                >
                    <Text style={styles.phaseText}>{getPhaseText()}</Text>
                    {isActive && <Text style={styles.timerText}>{timeLeft}</Text>}
                </Animated.View>
            </View>

            <View style={styles.instructions}>
                <View style={[styles.instructionItem, phase === 'inhale' && styles.instructionActive]}>
                    <View style={[styles.instructionDot, { backgroundColor: theme.colors.secondary }]} />
                    <Text style={styles.instructionText}>Inhale (4s)</Text>
                </View>
                <Ionicons name="arrow-forward" size={16} color={theme.colors.textLight} />
                <View style={[styles.instructionItem, phase === 'hold' && styles.instructionActive]}>
                    <View style={[styles.instructionDot, { backgroundColor: theme.colors.accent }]} />
                    <Text style={styles.instructionText}>Hold (4s)</Text>
                </View>
                <Ionicons name="arrow-forward" size={16} color={theme.colors.textLight} />
                <View style={[styles.instructionItem, phase === 'exhale' && styles.instructionActive]}>
                    <View style={[styles.instructionDot, { backgroundColor: theme.colors.primary }]} />
                    <Text style={styles.instructionText}>Exhale (4s)</Text>
                </View>
            </View>

            <TouchableOpacity
                style={[styles.controlButton, isActive && styles.controlButtonStop]}
                onPress={isActive ? stopBreathing : startBreathing}
                activeOpacity={0.8}
            >
                <Ionicons name={isActive ? 'stop' : 'play'} size={24} color="#FFFFFF" />
                <Text style={styles.controlButtonText}>{isActive ? 'Stop' : 'Start Breathing'}</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { backgroundColor: theme.colors.card, borderRadius: theme.borderRadius.xl, padding: theme.spacing.xl, alignItems: 'center', ...theme.shadows.card },
    header: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.s, marginBottom: theme.spacing.xs },
    title: { fontSize: 22, color: theme.colors.text, fontWeight: '700' as const },
    subtitle: { fontSize: 16, color: theme.colors.textLight, marginBottom: theme.spacing.xl },
    circleContainer: { width: 200, height: 200, justifyContent: 'center', alignItems: 'center', marginBottom: theme.spacing.xl },
    breathCircle: { width: 120, height: 120, borderRadius: 60, justifyContent: 'center', alignItems: 'center', ...theme.shadows.large },
    phaseText: { fontSize: 18, color: '#FFFFFF', fontWeight: '700' as const, textAlign: 'center' },
    timerText: { fontSize: 36, color: '#FFFFFF', fontWeight: '900' as const, marginTop: theme.spacing.xs },
    instructions: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.s, marginBottom: theme.spacing.xl, flexWrap: 'wrap', justifyContent: 'center' },
    instructionItem: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.xs, opacity: 0.6 },
    instructionActive: { opacity: 1 },
    instructionDot: { width: 8, height: 8, borderRadius: 4 },
    instructionText: { fontSize: 14, color: theme.colors.text },
    controlButton: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.s, backgroundColor: theme.colors.secondary, paddingVertical: theme.spacing.m, paddingHorizontal: theme.spacing.xl, borderRadius: theme.borderRadius.l, ...theme.shadows.medium },
    controlButtonStop: { backgroundColor: theme.colors.error },
    controlButtonText: { fontSize: 16, fontWeight: '700' as const, color: '#FFFFFF' },
});

export default BreathingExercise;
