import React, { useState, useRef, useEffect } from 'react';
import { 
    View, Text, StyleSheet, TouchableOpacity, TextInput, Animated, 
    Easing, Dimensions, ScrollView, Modal
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../theme';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

type RitualType = 'candle' | 'balloon' | 'sunrise' | 'bowl';

interface Balloon {
    id: string;
    text: string;
    x: number;
    anim: Animated.Value;
    rotateAnim: Animated.Value;
}

const RITUALS = [
    { 
        type: 'candle' as RitualType, 
        emoji: '🕯️', 
        title: 'Light a Candle', 
        subtitle: 'Set intentions & release',
        gradient: ['#FFE4B5', '#FFDAB9'] as [string, string],
        duration: '2 min'
    },
    { 
        type: 'balloon' as RitualType, 
        emoji: '🎈', 
        title: 'Release Worries', 
        subtitle: 'Let them float away',
        gradient: ['#E6E6FA', '#DCD0FF'] as [string, string],
        duration: '5 min'
    },
    { 
        type: 'sunrise' as RitualType, 
        emoji: '🌅', 
        title: 'Watch Sunrise', 
        subtitle: 'Fresh beginnings',
        gradient: ['#FFDAB9', '#FFB6C1'] as [string, string],
        duration: '3 min'
    },
    { 
        type: 'bowl' as RitualType, 
        emoji: '🔔', 
        title: 'Meditation Bowl', 
        subtitle: 'Find your center',
        gradient: ['#E0FFFF', '#B0E0E6'] as [string, string],
        duration: '1 min'
    },
];

export const HealingRituals: React.FC = () => {
    const [activeRitual, setActiveRitual] = useState<RitualType | null>(null);
    const [candleLit, setCandleLit] = useState(false);
    const [worryText, setWorryText] = useState('');
    const [balloons, setBalloons] = useState<Balloon[]>([]);
    const [showComplete, setShowComplete] = useState(false);
    const [intention, setIntention] = useState('');
    
    const flameAnim = useRef(new Animated.Value(0)).current;
    const flickerAnim = useRef(new Animated.Value(1)).current;
    const glowAnim = useRef(new Animated.Value(0)).current;
    const sunriseAnim = useRef(new Animated.Value(0)).current;
    const bowlRingAnim = useRef(new Animated.Value(0)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
    }, []);

    useEffect(() => {
        if (candleLit) {
            Animated.loop(
                Animated.sequence([
                    Animated.timing(flickerAnim, { toValue: 1.15, duration: 150 + Math.random() * 100, useNativeDriver: true }),
                    Animated.timing(flickerAnim, { toValue: 0.85, duration: 150 + Math.random() * 100, useNativeDriver: true }),
                    Animated.timing(flickerAnim, { toValue: 1.1, duration: 100 + Math.random() * 100, useNativeDriver: true }),
                    Animated.timing(flickerAnim, { toValue: 0.9, duration: 100 + Math.random() * 100, useNativeDriver: true }),
                ])
            ).start();
            
            Animated.loop(
                Animated.sequence([
                    Animated.timing(glowAnim, { toValue: 1, duration: 1500, useNativeDriver: true }),
                    Animated.timing(glowAnim, { toValue: 0.6, duration: 1500, useNativeDriver: true }),
                ])
            ).start();
        }
    }, [candleLit]);

    const lightCandle = () => {
        Animated.timing(flameAnim, { toValue: 1, duration: 600, easing: Easing.out(Easing.back(2)), useNativeDriver: true }).start();
        setCandleLit(true);
    };

    const blowOutCandle = () => {
        Animated.timing(flameAnim, { toValue: 0, duration: 400, useNativeDriver: true }).start(() => {
            setCandleLit(false);
            flickerAnim.setValue(1);
            glowAnim.setValue(0);
            completeRitual();
        });
    };

    const releaseBalloon = () => {
        if (!worryText.trim()) return;
        
        const newBalloon: Balloon = {
            id: 'balloon_' + Date.now(),
            text: worryText,
            x: Math.random() * (SCREEN_WIDTH - 120) + 60,
            anim: new Animated.Value(0),
            rotateAnim: new Animated.Value(0),
        };
        
        setBalloons(prev => [...prev, newBalloon]);
        setWorryText('');
        
        Animated.parallel([
            Animated.timing(newBalloon.anim, { toValue: 1, duration: 5000, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
            Animated.loop(
                Animated.sequence([
                    Animated.timing(newBalloon.rotateAnim, { toValue: 1, duration: 1200, useNativeDriver: true }),
                    Animated.timing(newBalloon.rotateAnim, { toValue: -1, duration: 2400, useNativeDriver: true }),
                    Animated.timing(newBalloon.rotateAnim, { toValue: 0, duration: 1200, useNativeDriver: true }),
                ])
            ),
        ]).start();
        
        setTimeout(() => {
            setBalloons(prev => prev.filter(b => b.id !== newBalloon.id));
        }, 5000);
    };

    const startSunrise = () => {
        sunriseAnim.setValue(0);
        Animated.timing(sunriseAnim, { toValue: 1, duration: 10000, easing: Easing.inOut(Easing.ease), useNativeDriver: false }).start(() => {
            setTimeout(completeRitual, 1500);
        });
    };

    const ringBowl = () => {
        bowlRingAnim.setValue(0);
        Animated.sequence([
            Animated.timing(bowlRingAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
            Animated.timing(bowlRingAnim, { toValue: 0, duration: 4000, useNativeDriver: true }),
        ]).start();
    };

    const completeRitual = () => {
        setShowComplete(true);
        setTimeout(() => {
            setShowComplete(false);
            setActiveRitual(null);
            setIntention('');
        }, 2500);
    };

    const renderRitualContent = () => {
        switch (activeRitual) {
            case 'candle':
                return (
                    <View style={styles.ritualScreen}>
                        <View style={styles.ritualHeader}>
                        <Text style={styles.ritualTitle}>Light a Candle</Text>
                            <Text style={styles.ritualSubtitle}>Set an intention, then release it to the universe</Text>
                        </View>
                        
                        {!candleLit && (
                            <View style={styles.intentionContainer}>
                                <Text style={styles.intentionLabel}>Your Intention</Text>
                                <TextInput
                                    style={styles.intentionInput}
                                    placeholder="What do you wish to manifest?"
                                    placeholderTextColor={theme.colors.textLight}
                                    value={intention}
                                    onChangeText={setIntention}
                                    multiline
                                />
                            </View>
                        )}
                        
                        <View style={styles.candleContainer}>
                            {candleLit && (
                                <>
                                    <Animated.View style={[styles.candleGlow, styles.candleGlowOuter, { 
                                        opacity: Animated.multiply(glowAnim, 0.3),
                                        transform: [{ scale: Animated.add(glowAnim, 1.2) }] 
                                    }]} />
                                    <Animated.View style={[styles.candleGlow, { 
                                        opacity: glowAnim,
                                        transform: [{ scale: Animated.add(glowAnim, 0.5) }] 
                                    }]} />
                                </>
                            )}
                            
                            <Animated.View style={[styles.flame, { 
                                opacity: flameAnim, 
                                transform: [
                                    { scale: flickerAnim }, 
                                    { translateY: flameAnim.interpolate({ inputRange: [0, 1], outputRange: [30, 0] }) }
                                ] 
                            }]}>
                                <View style={styles.flameCore} />
                                <View style={styles.flameInner} />
                                <View style={styles.flameOuter} />
                            </Animated.View>
                            
                            <View style={styles.candle}>
                                <View style={styles.wick} />
                                <View style={styles.candleDrip1} />
                                <View style={styles.candleDrip2} />
                            </View>
                            <View style={styles.candleHolder}>
                                <View style={styles.candleHolderRim} />
                            </View>
                        </View>

                        {candleLit && intention ? (
                            <View style={styles.intentionDisplay}>
                                <Text style={styles.intentionDisplayText}>"{intention}"</Text>
                            </View>
                        ) : null}

                        <View style={styles.buttonContainer}>
                        {!candleLit ? (
                                <TouchableOpacity style={styles.primaryButton} onPress={lightCandle}>
                                    <LinearGradient colors={['#FFB347', '#FFCC33']} style={styles.buttonGradient}>
                                        <Ionicons name="flame" size={22} color="#FFF" />
                                        <Text style={styles.buttonText}>Light the Candle</Text>
                                    </LinearGradient>
                            </TouchableOpacity>
                        ) : (
                                <TouchableOpacity style={styles.secondaryButton} onPress={blowOutCandle}>
                                    <View style={styles.secondaryButtonInner}>
                                        <Ionicons name="water" size={22} color={theme.colors.secondary} />
                                        <Text style={styles.secondaryButtonText}>Release & Blow Out</Text>
                                    </View>
                            </TouchableOpacity>
                        )}
                        </View>
                    </View>
                );
                
            case 'balloon':
                return (
                    <View style={styles.ritualScreen}>
                        <View style={styles.ritualHeader}>
                        <Text style={styles.ritualTitle}>Release Your Worries</Text>
                            <Text style={styles.ritualSubtitle}>Write what troubles you and watch it float away</Text>
                        </View>
                        
                        <View style={styles.skyContainer}>
                            <LinearGradient colors={['#87CEEB', '#E0F6FF']} style={styles.skyGradient}>
                            {balloons.map(balloon => (
                                <Animated.View
                                    key={balloon.id}
                                    style={[
                                        styles.balloon,
                                        {
                                            left: balloon.x,
                                            transform: [
                                                    { translateY: balloon.anim.interpolate({ inputRange: [0, 1], outputRange: [SCREEN_HEIGHT * 0.35, -150] }) },
                                                    { rotate: balloon.rotateAnim.interpolate({ inputRange: [-1, 0, 1], outputRange: ['-12deg', '0deg', '12deg'] }) },
                                                    { scale: balloon.anim.interpolate({ inputRange: [0, 0.5, 1], outputRange: [1, 0.85, 0.4] }) },
                                                ],
                                                opacity: balloon.anim.interpolate({ inputRange: [0, 0.6, 1], outputRange: [1, 0.9, 0] }),
                                        }
                                    ]}
                                >
                                    <View style={styles.balloonBody}>
                                            <View style={styles.balloonShine} />
                                            <Text style={styles.balloonText} numberOfLines={3}>{balloon.text}</Text>
                                    </View>
                                        <View style={styles.balloonKnot} />
                                    <View style={styles.balloonString} />
                                </Animated.View>
                            ))}
                                
                                {/* Decorative clouds */}
                                <View style={[styles.cloud, { top: 20, left: 30 }]} />
                                <View style={[styles.cloud, styles.cloudSmall, { top: 60, right: 40 }]} />
                                <View style={[styles.cloud, { top: 100, left: '50%' }]} />
                            </LinearGradient>
                        </View>
                        
                        <View style={styles.inputSection}>
                            <Text style={styles.inputLabel}>What would you like to release?</Text>
                            <View style={styles.inputRow}>
                            <TextInput
                                style={styles.worryInput}
                                placeholder="Write your worry here..."
                                placeholderTextColor={theme.colors.textLight}
                                value={worryText}
                                onChangeText={setWorryText}
                                multiline
                                    maxLength={80}
                            />
                            <TouchableOpacity 
                                style={[styles.releaseButton, !worryText.trim() && styles.releaseButtonDisabled]}
                                onPress={releaseBalloon}
                                disabled={!worryText.trim()}
                            >
                                    <LinearGradient 
                                        colors={worryText.trim() ? ['#A29BFE', '#6C5CE7'] : ['#DDD', '#CCC']} 
                                        style={styles.releaseButtonGradient}
                                    >
                                        <Ionicons name="arrow-up" size={28} color="#FFF" />
                                    </LinearGradient>
                            </TouchableOpacity>
                            </View>
                        </View>
                        
                        <TouchableOpacity style={styles.doneButton} onPress={completeRitual}>
                            <Text style={styles.doneButtonText}>I feel lighter ✨</Text>
                        </TouchableOpacity>
                    </View>
                );
                
            case 'sunrise':
                const skyColor = sunriseAnim.interpolate({ 
                    inputRange: [0, 0.2, 0.5, 0.8, 1], 
                    outputRange: ['#0F0C29', '#302B63', '#FF7E5F', '#FEB47B', '#87CEEB'] 
                });
                const sunPosition = sunriseAnim.interpolate({ inputRange: [0, 1], outputRange: [SCREEN_HEIGHT * 0.55, SCREEN_HEIGHT * 0.12] });
                const sunScale = sunriseAnim.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.8, 1.2, 1] });
                
                return (
                    <Animated.View style={[styles.sunriseScreen, { backgroundColor: skyColor }]}>
                        <View style={styles.sunriseHeader}>
                            <Text style={styles.sunriseTitle}>A New Dawn</Text>
                            <Text style={styles.sunriseSubtitle}>Every sunrise is a chance to begin again</Text>
                        </View>
                        
                        {/* Stars (visible at night) */}
                        <Animated.View style={{ opacity: sunriseAnim.interpolate({ inputRange: [0, 0.3], outputRange: [1, 0] }) }}>
                            {[...Array(12)].map((_, i) => (
                                <View key={i} style={[styles.star, { 
                                    top: 80 + Math.random() * 200, 
                                    left: 30 + Math.random() * (SCREEN_WIDTH - 60),
                                    opacity: 0.4 + Math.random() * 0.6
                                }]} />
                            ))}
                        </Animated.View>
                        
                        {/* Sun */}
                        <Animated.View style={[styles.sun, { top: sunPosition, transform: [{ scale: sunScale }] }]}>
                            <View style={styles.sunRay3} />
                            <View style={styles.sunRay2} />
                            <View style={styles.sunRay1} />
                            <View style={styles.sunCore} />
                        </Animated.View>
                        
                        {/* Landscape */}
                        <View style={styles.horizon}>
                            <View style={styles.mountain1} />
                            <View style={styles.mountain2} />
                            <View style={styles.hill1} />
                            <View style={styles.hill2} />
                            <View style={styles.ground} />
                        </View>
                        
                        <TouchableOpacity style={styles.startSunriseButton} onPress={startSunrise}>
                            <Text style={styles.startSunriseText}>Begin Your New Day</Text>
                        </TouchableOpacity>
                    </Animated.View>
                );
                
            case 'bowl':
                return (
                    <View style={styles.ritualScreen}>
                        <View style={styles.ritualHeader}>
                        <Text style={styles.ritualTitle}>Meditation Bowl</Text>
                            <Text style={styles.ritualSubtitle}>Let the sound wash over you and find stillness</Text>
                        </View>
                        
                        <View style={styles.bowlSection}>
                            <TouchableOpacity style={styles.bowlContainer} onPress={ringBowl} activeOpacity={0.95}>
                                {/* Ripple rings */}
                                <Animated.View style={[styles.bowlRing, { 
                                    transform: [{ scale: Animated.add(bowlRingAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 2.5] }), 0) }], 
                                    opacity: bowlRingAnim.interpolate({ inputRange: [0, 0.1, 1], outputRange: [0, 0.8, 0] }),
                                    borderColor: theme.colors.secondary
                                }]} />
                                <Animated.View style={[styles.bowlRing, { 
                                    transform: [{ scale: Animated.add(bowlRingAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 3.5] }), 0) }], 
                                    opacity: bowlRingAnim.interpolate({ inputRange: [0, 0.15, 1], outputRange: [0, 0.5, 0] }),
                                    borderColor: theme.colors.secondary + '80'
                                }]} />
                                <Animated.View style={[styles.bowlRing, { 
                                    transform: [{ scale: Animated.add(bowlRingAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 4.5] }), 0) }], 
                                    opacity: bowlRingAnim.interpolate({ inputRange: [0, 0.2, 1], outputRange: [0, 0.3, 0] }),
                                    borderColor: theme.colors.secondary + '40'
                                }]} />
                                
                            <View style={styles.bowl}>
                                    <LinearGradient colors={['#D4AF37', '#C5A028', '#B8860B']} style={styles.bowlGradient}>
                                        <View style={styles.bowlShine} />
                                    </LinearGradient>
                            </View>
                                <View style={styles.bowlStand} />
                        </TouchableOpacity>
                        
                        <Text style={styles.bowlHint}>Tap the bowl to ring</Text>
                        </View>
                        
                        <View style={styles.meditationTips}>
                            <Text style={styles.tipsTitle}>As you listen...</Text>
                            <View style={styles.tipItem}>
                                <View style={styles.tipDot} />
                                <Text style={styles.tipText}>Close your eyes gently</Text>
                            </View>
                            <View style={styles.tipItem}>
                                <View style={styles.tipDot} />
                                <Text style={styles.tipText}>Focus on your breath</Text>
                            </View>
                            <View style={styles.tipItem}>
                                <View style={styles.tipDot} />
                                <Text style={styles.tipText}>Let thoughts pass like clouds</Text>
                            </View>
                        </View>
                        
                        <TouchableOpacity style={styles.doneButton} onPress={completeRitual}>
                            <Text style={styles.doneButtonText}>I am centered ✨</Text>
                        </TouchableOpacity>
                    </View>
                );
                
            default:
                return null;
        }
    };

    if (activeRitual) {
        return (
            <View style={styles.container}>
                <TouchableOpacity style={styles.backButton} onPress={() => setActiveRitual(null)}>
                    <View style={styles.backButtonInner}>
                        <Ionicons name="arrow-back" size={22} color={theme.colors.text} />
                    </View>
                </TouchableOpacity>
                
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.ritualContent}>
                {renderRitualContent()}
                </ScrollView>
                
                {/* Completion Modal */}
                <Modal visible={showComplete} transparent animationType="fade">
                    <View style={styles.completeOverlay}>
                        <View style={styles.completeCard}>
                            <View style={styles.completeEmoji}>
                                <Text style={{ fontSize: 48 }}>✨</Text>
                            </View>
                            <Text style={styles.completeTitle}>Ritual Complete</Text>
                            <Text style={styles.completeSubtitle}>Take this peace with you</Text>
                        </View>
                    </View>
                </Modal>
            </View>
        );
    }

    return (
        <Animated.ScrollView 
            style={[styles.container, { opacity: fadeAnim }]} 
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
        >
            {/* Hero Section */}
            <View style={styles.heroSection}>
                <View style={styles.heroIcon}>
                    <Text style={{ fontSize: 36 }}>🧘‍♀️</Text>
                </View>
                <Text style={styles.heroTitle}>Healing Rituals</Text>
                <Text style={styles.heroSubtitle}>
                    Daily micro-practices to nurture your emotional wellbeing
                </Text>
            </View>
            
            {/* Rituals Grid */}
            <View style={styles.ritualsGrid}>
                {RITUALS.map((ritual, index) => (
                    <TouchableOpacity 
                        key={ritual.type} 
                        style={styles.ritualCard} 
                        onPress={() => setActiveRitual(ritual.type)}
                        activeOpacity={0.9}
                    >
                        <LinearGradient colors={ritual.gradient} style={styles.ritualCardGradient}>
                            <View style={styles.ritualCardContent}>
                                <View style={styles.ritualIconContainer}>
                                    <Text style={styles.ritualEmoji}>{ritual.emoji}</Text>
                                </View>
                                <Text style={styles.ritualCardTitle}>{ritual.title}</Text>
                                <Text style={styles.ritualCardSubtitle}>{ritual.subtitle}</Text>
                                <View style={styles.durationBadge}>
                                    <Ionicons name="time-outline" size={12} color={theme.colors.textLight} />
                                    <Text style={styles.durationText}>{ritual.duration}</Text>
                    </View>
                    </View>
                        </LinearGradient>
                </TouchableOpacity>
                ))}
                    </View>
            
            {/* Info Section */}
            <View style={styles.infoSection}>
                <View style={styles.infoIcon}>
                    <Ionicons name="heart" size={20} color={theme.colors.primary} />
                    </View>
                <Text style={styles.infoText}>
                    These rituals are designed to create moments of calm and presence. 
                    Even just one minute can make a difference.
                </Text>
            </View>
            
            <View style={{ height: 100 }} />
        </Animated.ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    scrollContent: { paddingBottom: 40 },
    
    // Hero Section
    heroSection: { alignItems: 'center', marginBottom: theme.spacing.xl, paddingTop: theme.spacing.m },
    heroIcon: { 
        width: 72, height: 72, borderRadius: 36, 
        backgroundColor: theme.colors.secondary + '15', 
        justifyContent: 'center', alignItems: 'center', 
        marginBottom: theme.spacing.m 
    },
    heroTitle: { 
        fontSize: 28, fontWeight: '800' as const, color: theme.colors.text, 
        letterSpacing: -0.5, marginBottom: theme.spacing.xs 
    },
    heroSubtitle: { 
        fontSize: 16, color: theme.colors.textLight, 
        textAlign: 'center', lineHeight: 24, paddingHorizontal: theme.spacing.xl 
    },
    
    // Rituals Grid - 2x2 layout
    ritualsGrid: { 
        flexDirection: 'row', 
        flexWrap: 'wrap', 
        justifyContent: 'space-between',
        paddingHorizontal: 0,
    },
    ritualCard: { 
        width: (SCREEN_WIDTH - 48) / 2, // 2 columns with 16px gap
        marginBottom: theme.spacing.m,
        borderRadius: theme.borderRadius.xl, 
        overflow: 'hidden',
        ...theme.shadows.card 
    },
    ritualCardGradient: { 
        padding: theme.spacing.m,
        paddingVertical: theme.spacing.l,
    },
    ritualCardContent: { 
        alignItems: 'center',
        justifyContent: 'center',
    },
    ritualIconContainer: { 
        width: 56, height: 56, borderRadius: 28, 
        backgroundColor: 'rgba(255,255,255,0.6)', 
        justifyContent: 'center', alignItems: 'center', 
        marginBottom: theme.spacing.s,
        ...theme.shadows.soft
    },
    ritualEmoji: { fontSize: 28 },
    ritualCardTitle: { 
        fontSize: 15, fontWeight: '700' as const, color: theme.colors.text, 
        textAlign: 'center', marginBottom: 4,
        height: 20,
    },
    ritualCardSubtitle: { 
        fontSize: 12, color: theme.colors.textLight, textAlign: 'center', 
        marginBottom: theme.spacing.s,
        height: 16,
    },
    durationBadge: { 
        flexDirection: 'row', alignItems: 'center', gap: 4, 
        backgroundColor: 'rgba(255,255,255,0.7)', 
        paddingHorizontal: theme.spacing.s, paddingVertical: 4, 
        borderRadius: theme.borderRadius.circle 
    },
    durationText: { fontSize: 11, color: theme.colors.textLight, fontWeight: '600' as const },
    
    // Info Section
    infoSection: { 
        flexDirection: 'row', alignItems: 'flex-start', gap: theme.spacing.m, 
        backgroundColor: theme.colors.primary + '08', 
        padding: theme.spacing.l, borderRadius: theme.borderRadius.xl, 
        marginTop: theme.spacing.xl, marginHorizontal: theme.spacing.xs 
    },
    infoIcon: { 
        width: 36, height: 36, borderRadius: 18, 
        backgroundColor: theme.colors.primary + '15', 
        justifyContent: 'center', alignItems: 'center' 
    },
    infoText: { flex: 1, fontSize: 14, color: theme.colors.text, lineHeight: 22 },
    
    // Back Button
    backButton: { position: 'absolute', top: 8, left: 8, zIndex: 10 },
    backButtonInner: { 
        width: 44, height: 44, borderRadius: 22, 
        backgroundColor: theme.colors.card, 
        justifyContent: 'center', alignItems: 'center', 
        ...theme.shadows.soft 
    },
    
    // Ritual Screen
    ritualContent: { flexGrow: 1 },
    ritualScreen: { flex: 1, paddingTop: 60, paddingHorizontal: theme.spacing.m },
    ritualHeader: { alignItems: 'center', marginBottom: theme.spacing.xl },
    ritualTitle: { 
        fontSize: 26, fontWeight: '800' as const, color: theme.colors.text, 
        letterSpacing: -0.5, marginBottom: theme.spacing.xs 
    },
    ritualSubtitle: { 
        fontSize: 16, color: theme.colors.textLight, 
        textAlign: 'center', lineHeight: 24, paddingHorizontal: theme.spacing.m 
    },
    
    // Candle Ritual
    intentionContainer: { 
        backgroundColor: theme.colors.card, borderRadius: theme.borderRadius.xl, 
        padding: theme.spacing.l, marginBottom: theme.spacing.xl, 
        ...theme.shadows.card 
    },
    intentionLabel: { fontSize: 14, fontWeight: '600' as const, color: theme.colors.textLight, marginBottom: theme.spacing.s },
    intentionInput: { 
        fontSize: 16, color: theme.colors.text, lineHeight: 24, 
        minHeight: 60, textAlignVertical: 'top' 
    },
    intentionDisplay: { 
        backgroundColor: theme.colors.accent + '20', 
        padding: theme.spacing.l, borderRadius: theme.borderRadius.l, 
        marginBottom: theme.spacing.l, alignItems: 'center' 
    },
    intentionDisplayText: { 
        fontSize: 16, color: theme.colors.text, fontStyle: 'italic', 
        textAlign: 'center', lineHeight: 24 
    },
    
    candleContainer: { alignItems: 'center', marginBottom: theme.spacing.xl, height: 280, justifyContent: 'flex-end' },
    candleGlow: { 
        position: 'absolute', width: 180, height: 180, borderRadius: 90, 
        backgroundColor: '#FFA500', top: 10 
    },
    candleGlowOuter: { width: 260, height: 260, borderRadius: 130, top: -30, backgroundColor: '#FF8C00' },
    flame: { position: 'absolute', top: 50, alignItems: 'center' },
    flameCore: { 
        position: 'absolute', width: 12, height: 20, 
        backgroundColor: '#FFFACD', borderRadius: 6, top: 20, zIndex: 3 
    },
    flameInner: { 
        position: 'absolute', width: 22, height: 38, 
        backgroundColor: '#FFD93D', borderRadius: 11, top: 8, zIndex: 2 
    },
    flameOuter: { 
        width: 34, height: 56, backgroundColor: '#FF6B35', 
        borderRadius: 17, transform: [{ rotate: '180deg' }], zIndex: 1 
    },
    candle: { 
        width: 56, height: 130, backgroundColor: '#FAF0E6', 
        borderRadius: 8, alignItems: 'center', 
        borderWidth: 1, borderColor: '#F0E6DC' 
    },
    wick: { width: 3, height: 18, backgroundColor: '#2C2C2C', marginTop: -9, borderRadius: 1.5 },
    candleDrip1: { 
        position: 'absolute', top: 15, left: 8, width: 8, height: 20, 
        backgroundColor: '#FFF8F0', borderRadius: 4 
    },
    candleDrip2: { 
        position: 'absolute', top: 25, right: 6, width: 6, height: 15, 
        backgroundColor: '#FFF8F0', borderRadius: 3 
    },
    candleHolder: { 
        width: 80, height: 24, backgroundColor: '#C0A080', 
        borderRadius: 12, marginTop: -4, alignItems: 'center', justifyContent: 'flex-start' 
    },
    candleHolderRim: { 
        width: 90, height: 8, backgroundColor: '#D4AF37', 
        borderRadius: 4, marginTop: -2 
    },
    
    // Buttons
    buttonContainer: { alignItems: 'center', marginTop: theme.spacing.l },
    primaryButton: { borderRadius: theme.borderRadius.l, overflow: 'hidden', ...theme.shadows.medium },
    buttonGradient: { 
        flexDirection: 'row', alignItems: 'center', gap: theme.spacing.s, 
        paddingVertical: theme.spacing.m, paddingHorizontal: theme.spacing.xl 
    },
    buttonText: { fontSize: 17, fontWeight: '700' as const, color: '#FFF' },
    secondaryButton: { 
        borderRadius: theme.borderRadius.l, borderWidth: 2, 
        borderColor: theme.colors.secondary, overflow: 'hidden' 
    },
    secondaryButtonInner: { 
        flexDirection: 'row', alignItems: 'center', gap: theme.spacing.s, 
        paddingVertical: theme.spacing.m, paddingHorizontal: theme.spacing.xl 
    },
    secondaryButtonText: { fontSize: 17, fontWeight: '700' as const, color: theme.colors.secondary },
    
    // Balloon Ritual
    skyContainer: { height: SCREEN_HEIGHT * 0.4, marginBottom: theme.spacing.l, borderRadius: theme.borderRadius.xl, overflow: 'hidden' },
    skyGradient: { flex: 1, position: 'relative' },
    cloud: { 
        position: 'absolute', width: 80, height: 30, 
        backgroundColor: 'rgba(255,255,255,0.8)', borderRadius: 20 
    },
    cloudSmall: { width: 50, height: 20 },
    balloon: { position: 'absolute', alignItems: 'center' },
    balloonBody: { 
        width: 90, height: 110, backgroundColor: '#FF6B6B', 
        borderRadius: 45, borderBottomLeftRadius: 40, borderBottomRightRadius: 40,
        justifyContent: 'center', alignItems: 'center', padding: theme.spacing.s,
        ...theme.shadows.medium
    },
    balloonShine: { 
        position: 'absolute', top: 12, left: 18, width: 18, height: 18, 
        borderRadius: 9, backgroundColor: 'rgba(255,255,255,0.4)' 
    },
    balloonText: { fontSize: 10, color: '#FFF', textAlign: 'center', fontWeight: '600' as const },
    balloonKnot: { 
        width: 0, height: 0, borderLeftWidth: 8, borderRightWidth: 8, borderTopWidth: 12,
        borderLeftColor: 'transparent', borderRightColor: 'transparent', borderTopColor: '#E55555'
    },
    balloonString: { width: 1, height: 35, backgroundColor: '#999' },
    
    inputSection: { paddingHorizontal: theme.spacing.xs },
    inputLabel: { fontSize: 15, fontWeight: '600' as const, color: theme.colors.text, marginBottom: theme.spacing.s },
    inputRow: { flexDirection: 'row', alignItems: 'flex-end', gap: theme.spacing.m },
    worryInput: { 
        flex: 1, backgroundColor: theme.colors.card, borderRadius: theme.borderRadius.l, 
        padding: theme.spacing.m, fontSize: 16, color: theme.colors.text, 
        minHeight: 56, maxHeight: 100, borderWidth: 1, borderColor: theme.colors.border,
        ...theme.shadows.soft
    },
    releaseButton: { borderRadius: 28, overflow: 'hidden' },
    releaseButtonDisabled: { opacity: 0.5 },
    releaseButtonGradient: { width: 56, height: 56, justifyContent: 'center', alignItems: 'center' },
    
    doneButton: { 
        alignSelf: 'center', marginTop: theme.spacing.xl, 
        paddingVertical: theme.spacing.m, paddingHorizontal: theme.spacing.xl 
    },
    doneButtonText: { fontSize: 17, color: theme.colors.primary, fontWeight: '600' as const },
    
    // Sunrise Ritual
    sunriseScreen: { flex: 1, minHeight: SCREEN_HEIGHT - 120, justifyContent: 'space-between' },
    sunriseHeader: { alignItems: 'center', paddingTop: 70 },
    sunriseTitle: { fontSize: 28, fontWeight: '800' as const, color: '#FFF', letterSpacing: -0.5 },
    sunriseSubtitle: { fontSize: 16, color: 'rgba(255,255,255,0.8)', marginTop: theme.spacing.xs, textAlign: 'center' },
    star: { position: 'absolute', width: 3, height: 3, backgroundColor: '#FFF', borderRadius: 1.5 },
    sun: { position: 'absolute', alignSelf: 'center', alignItems: 'center', justifyContent: 'center' },
    sunCore: { width: 90, height: 90, borderRadius: 45, backgroundColor: '#FFD700', ...theme.shadows.large },
    sunRay1: { position: 'absolute', width: 130, height: 130, borderRadius: 65, backgroundColor: 'rgba(255,215,0,0.4)' },
    sunRay2: { position: 'absolute', width: 170, height: 170, borderRadius: 85, backgroundColor: 'rgba(255,215,0,0.2)' },
    sunRay3: { position: 'absolute', width: 210, height: 210, borderRadius: 105, backgroundColor: 'rgba(255,215,0,0.1)' },
    horizon: { height: 180, position: 'relative' },
    mountain1: { 
        position: 'absolute', bottom: 60, left: -30, 
        width: 0, height: 0, borderLeftWidth: 150, borderRightWidth: 150, borderBottomWidth: 140,
        borderLeftColor: 'transparent', borderRightColor: 'transparent', borderBottomColor: '#2D5A27'
    },
    mountain2: { 
        position: 'absolute', bottom: 60, right: -20, 
        width: 0, height: 0, borderLeftWidth: 120, borderRightWidth: 120, borderBottomWidth: 110,
        borderLeftColor: 'transparent', borderRightColor: 'transparent', borderBottomColor: '#3D7A37'
    },
    hill1: { 
        position: 'absolute', bottom: 0, left: -60, width: 250, height: 100, 
        backgroundColor: '#228B22', borderTopLeftRadius: 125, borderTopRightRadius: 125 
    },
    hill2: { 
        position: 'absolute', bottom: 0, right: -40, width: 200, height: 80, 
        backgroundColor: '#2E8B57', borderTopLeftRadius: 100, borderTopRightRadius: 100 
    },
    ground: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 40, backgroundColor: '#228B22' },
    startSunriseButton: { 
        backgroundColor: 'rgba(255,255,255,0.25)', 
        paddingVertical: theme.spacing.m, paddingHorizontal: theme.spacing.xl, 
        borderRadius: theme.borderRadius.l, alignSelf: 'center', marginBottom: 60,
        borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)'
    },
    startSunriseText: { fontSize: 17, color: '#FFF', fontWeight: '700' as const },
    
    // Bowl Ritual
    bowlSection: { alignItems: 'center', marginBottom: theme.spacing.xl },
    bowlContainer: { alignItems: 'center', justifyContent: 'center', width: 220, height: 220 },
    bowlRing: { position: 'absolute', width: 80, height: 80, borderRadius: 40, borderWidth: 2 },
    bowl: { width: 100, height: 50, borderRadius: 50, overflow: 'hidden', ...theme.shadows.large },
    bowlGradient: { 
        flex: 1, justifyContent: 'center', alignItems: 'center', 
        borderTopLeftRadius: 50, borderTopRightRadius: 50 
    },
    bowlShine: { 
        position: 'absolute', top: 8, left: 20, width: 30, height: 12, 
        backgroundColor: 'rgba(255,255,255,0.4)', borderRadius: 6 
    },
    bowlStand: { 
        width: 40, height: 20, backgroundColor: '#8B4513', 
        borderBottomLeftRadius: 20, borderBottomRightRadius: 20, marginTop: -2 
    },
    bowlHint: { fontSize: 14, color: theme.colors.textLight, marginTop: theme.spacing.l },
    
    meditationTips: { 
        backgroundColor: theme.colors.card, borderRadius: theme.borderRadius.xl, 
        padding: theme.spacing.l, marginHorizontal: theme.spacing.xs, 
        ...theme.shadows.card 
    },
    tipsTitle: { fontSize: 16, fontWeight: '700' as const, color: theme.colors.text, marginBottom: theme.spacing.m },
    tipItem: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.m, marginBottom: theme.spacing.s },
    tipDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: theme.colors.secondary },
    tipText: { fontSize: 15, color: theme.colors.textLight },
    
    // Complete Modal
    completeOverlay: { 
        flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', 
        justifyContent: 'center', alignItems: 'center' 
    },
    completeCard: { 
        backgroundColor: theme.colors.card, borderRadius: theme.borderRadius.xl, 
        padding: theme.spacing.xxl, alignItems: 'center', ...theme.shadows.large,
        marginHorizontal: theme.spacing.xl
    },
    completeEmoji: { marginBottom: theme.spacing.m },
    completeTitle: { fontSize: 24, fontWeight: '800' as const, color: theme.colors.text, marginBottom: theme.spacing.xs },
    completeSubtitle: { fontSize: 16, color: theme.colors.textLight },
});

export default HealingRituals;
