import React, { useState, useRef, useEffect } from 'react';
import { 
    View, Text, StyleSheet, TouchableOpacity, TextInput, Animated, 
    Easing, Modal, ScrollView, Dimensions 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../theme';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface Letter {
    id: string;
    content: string;
    createdAt: string;
    deliverAt: string;
    isOpened: boolean;
    prompt?: string;
}

const PROMPTS = [
    "What do you hope to feel by the time you read this?",
    "What are you proud of yourself for today?",
    "What lesson are you learning right now?",
    "What would you tell your past self about this moment?",
    "What are you grateful for despite the pain?",
    "What does healing look like for you?",
    "What strength have you discovered in yourself?",
    "What would make future you smile?",
];

const DELIVERY_OPTIONS = [
    { days: 7, label: '1 Week', emoji: '🌱' },
    { days: 30, label: '1 Month', emoji: '🌿' },
    { days: 60, label: '2 Months', emoji: '🌳' },
    { days: 90, label: '3 Months', emoji: '🌸' },
];

export const LetterToSelf: React.FC = () => {
    const [isWriting, setIsWriting] = useState(false);
    const [letterContent, setLetterContent] = useState('');
    const [selectedDays, setSelectedDays] = useState(30);
    const [currentPrompt, setCurrentPrompt] = useState(PROMPTS[0]);
    const [showSealing, setShowSealing] = useState(false);
    const [letters, setLetters] = useState<Letter[]>([]);
    const [selectedLetter, setSelectedLetter] = useState<Letter | null>(null);
    
    const sealAnim = useRef(new Animated.Value(0)).current;
    const envelopeScale = useRef(new Animated.Value(1)).current;
    const stampRotate = useRef(new Animated.Value(0)).current;
    const floatAnim = useRef(new Animated.Value(0)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const shimmerAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
        
        // Floating animation for envelope
        Animated.loop(
            Animated.sequence([
                Animated.timing(floatAnim, { toValue: 1, duration: 2500, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
                Animated.timing(floatAnim, { toValue: 0, duration: 2500, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
            ])
        ).start();
        
        // Shimmer animation
        Animated.loop(
            Animated.timing(shimmerAnim, { toValue: 1, duration: 2000, easing: Easing.linear, useNativeDriver: true })
        ).start();
    }, []);

    const shufflePrompt = () => {
        const available = PROMPTS.filter(p => p !== currentPrompt);
        const newPrompt = available[Math.floor(Math.random() * available.length)];
        setCurrentPrompt(newPrompt);
    };

    const sealLetter = () => {
        if (!letterContent.trim()) return;
        
        setShowSealing(true);
        
        Animated.sequence([
            Animated.timing(envelopeScale, { toValue: 0.9, duration: 200, useNativeDriver: true }),
            Animated.parallel([
                Animated.timing(sealAnim, { toValue: 1, duration: 800, easing: Easing.elastic(1), useNativeDriver: true }),
                Animated.timing(stampRotate, { toValue: 1, duration: 600, easing: Easing.out(Easing.back(2)), useNativeDriver: true }),
            ]),
            Animated.timing(envelopeScale, { toValue: 1.05, duration: 300, useNativeDriver: true }),
            Animated.timing(envelopeScale, { toValue: 1, duration: 200, useNativeDriver: true }),
        ]).start(() => {
            const deliverDate = new Date();
            deliverDate.setDate(deliverDate.getDate() + selectedDays);
            
            const newLetter: Letter = {
                id: 'letter_' + Date.now(),
                content: letterContent,
                createdAt: new Date().toISOString(),
                deliverAt: deliverDate.toISOString(),
                isOpened: false,
                prompt: currentPrompt,
            };
            
            setLetters(prev => [newLetter, ...prev]);
            
            setTimeout(() => {
                setShowSealing(false);
                setIsWriting(false);
                setLetterContent('');
                sealAnim.setValue(0);
                stampRotate.setValue(0);
            }, 1800);
        });
    };

    const canOpenLetter = (letter: Letter) => new Date() >= new Date(letter.deliverAt);

    const getDaysUntilOpen = (letter: Letter) => {
        const now = new Date();
        const deliver = new Date(letter.deliverAt);
        const diff = Math.ceil((deliver.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        return Math.max(0, diff);
    };

    const openLetter = (letter: Letter) => {
        if (canOpenLetter(letter)) {
            setLetters(prev => prev.map(l => l.id === letter.id ? { ...l, isOpened: true } : l));
            setSelectedLetter({ ...letter, isOpened: true });
        }
    };

    const floatTranslate = floatAnim.interpolate({ inputRange: [0, 1], outputRange: [0, -12] });
    const sealScale = sealAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 1] });
    const stampRotation = stampRotate.interpolate({ inputRange: [0, 1], outputRange: ['-30deg', '0deg'] });

    if (isWriting) {
        return (
            <ScrollView 
                style={styles.container} 
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >
                <View style={styles.writingContainer}>
                    {/* Header */}
                    <View style={styles.writingHeader}>
                        <TouchableOpacity style={styles.backButton} onPress={() => setIsWriting(false)}>
                            <View style={styles.backButtonInner}>
                                <Ionicons name="arrow-back" size={22} color={theme.colors.text} />
                            </View>
                        </TouchableOpacity>
                        <Text style={styles.writingTitle}>Write to Future You</Text>
                        <View style={{ width: 44 }} />
                    </View>

                    {/* Prompt Card */}
                    <TouchableOpacity style={styles.promptCard} onPress={shufflePrompt} activeOpacity={0.8}>
                        <LinearGradient colors={['#FFF9E6', '#FFF4D6']} style={styles.promptGradient}>
                            <View style={styles.promptHeader}>
                                <Ionicons name="sparkles" size={18} color={theme.colors.accent} />
                                <Text style={styles.promptLabel}>Writing Prompt</Text>
                                <TouchableOpacity onPress={shufflePrompt} style={styles.shuffleButton}>
                                    <Ionicons name="refresh" size={16} color={theme.colors.textLight} />
                                </TouchableOpacity>
                            </View>
                            <Text style={styles.promptText}>{currentPrompt}</Text>
                        </LinearGradient>
                    </TouchableOpacity>

                    {/* Letter Paper */}
                    <View style={styles.paperContainer}>
                        <View style={styles.paper}>
                            <View style={styles.paperHeader}>
                                <Text style={styles.paperDate}>
                                    {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                                </Text>
                            </View>
                            <TextInput
                                style={styles.letterInput}
                                placeholder="Dear Future Me,

I'm writing to you from a moment where..."
                                placeholderTextColor={theme.colors.textLight}
                                value={letterContent}
                                onChangeText={setLetterContent}
                                multiline
                                textAlignVertical="top"
                            />
                            <View style={styles.paperFooter}>
                                <Text style={styles.characterCount}>{letterContent.length} / 1000</Text>
                            </View>
                        </View>
                    </View>

                    {/* Delivery Time */}
                    <View style={styles.deliverySection}>
                        <Text style={styles.deliveryTitle}>Deliver this letter in:</Text>
                        <View style={styles.deliveryOptions}>
                            {DELIVERY_OPTIONS.map(option => (
                                <TouchableOpacity
                                    key={option.days}
                                    style={[styles.deliveryOption, selectedDays === option.days && styles.deliveryOptionActive]}
                                    onPress={() => setSelectedDays(option.days)}
                                    activeOpacity={0.7}
                                >
                                    <Text style={styles.deliveryEmoji}>{option.emoji}</Text>
                                    <Text style={[styles.deliveryLabel, selectedDays === option.days && styles.deliveryLabelActive]}>
                                        {option.label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    {/* Seal Button */}
                    <TouchableOpacity 
                        style={[styles.sealButton, !letterContent.trim() && styles.sealButtonDisabled]}
                        onPress={sealLetter}
                        disabled={!letterContent.trim()}
                        activeOpacity={0.9}
                    >
                        <LinearGradient 
                            colors={letterContent.trim() ? [theme.colors.primary, theme.colors.primaryDark] : ['#DDD', '#CCC']} 
                            style={styles.sealButtonGradient}
                        >
                            <Ionicons name="lock-closed" size={20} color="#FFF" />
                            <Text style={styles.sealButtonText}>Seal & Send to Future</Text>
                        </LinearGradient>
                    </TouchableOpacity>

                    <View style={{ height: 40 }} />
                </View>

                {/* Sealing Animation Modal */}
                <Modal visible={showSealing} transparent animationType="fade">
                    <View style={styles.sealingOverlay}>
                        <Animated.View style={[styles.envelope, { transform: [{ scale: envelopeScale }] }]}>
                            {/* Envelope body */}
                            <View style={styles.envelopeBody}>
                                <View style={styles.envelopePattern}>
                                    <Ionicons name="heart" size={32} color={theme.colors.primary + '20'} />
                                </View>
                            </View>
                            
                            {/* Envelope flap */}
                            <View style={styles.envelopeFlap} />
                            
                            {/* Wax seal */}
                            <Animated.View style={[styles.waxSeal, { transform: [{ scale: sealScale }, { rotate: stampRotation }] }]}>
                                <View style={styles.waxSealInner}>
                                    <Text style={styles.waxSealEmoji}>💝</Text>
                                </View>
                            </Animated.View>
                        </Animated.View>
                        
                        <Text style={styles.sealingText}>Sealing with love...</Text>
                        <Text style={styles.sealingSubtext}>Your letter will be delivered in {selectedDays} days</Text>
                    </View>
                </Modal>
            </ScrollView>
        );
    }

    return (
        <Animated.ScrollView 
            style={[styles.container, { opacity: fadeAnim }]} 
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
        >
            {/* Hero Card */}
            <Animated.View style={[styles.heroCard, { transform: [{ translateY: floatTranslate }] }]}>
                <View style={styles.heroEnvelopeContainer}>
                    <View style={styles.heroEnvelope}>
                        <Text style={styles.heroEmoji}>💌</Text>
                    </View>
                    <View style={styles.heroEnvelopeShadow} />
                </View>
                
                <Text style={styles.heroTitle}>Letter to Future Self</Text>
                <Text style={styles.heroSubtitle}>
                    Write a message to yourself. It will be sealed and delivered when you're ready to receive it.
                </Text>
                
                <TouchableOpacity style={styles.writeButton} onPress={() => setIsWriting(true)} activeOpacity={0.9}>
                    <LinearGradient colors={[theme.colors.primary, theme.colors.primaryDark]} style={styles.writeButtonGradient}>
                        <Ionicons name="create" size={20} color="#FFF" />
                        <Text style={styles.writeButtonText}>Write a Letter</Text>
                    </LinearGradient>
                </TouchableOpacity>
            </Animated.View>

            {/* Benefits Section */}
            <View style={styles.benefitsSection}>
                <Text style={styles.benefitsTitle}>Why Write to Yourself?</Text>
                <View style={styles.benefitsList}>
                    <View style={styles.benefitItem}>
                        <View style={[styles.benefitIcon, { backgroundColor: theme.colors.secondary + '15' }]}>
                            <Ionicons name="time" size={18} color={theme.colors.secondary} />
                        </View>
                        <View style={styles.benefitContent}>
                            <Text style={styles.benefitLabel}>Gain Perspective</Text>
                            <Text style={styles.benefitText}>See how far you've come</Text>
                        </View>
                    </View>
                    <View style={styles.benefitItem}>
                        <View style={[styles.benefitIcon, { backgroundColor: theme.colors.primary + '15' }]}>
                            <Ionicons name="heart" size={18} color={theme.colors.primary} />
                        </View>
                        <View style={styles.benefitContent}>
                            <Text style={styles.benefitLabel}>Self-Compassion</Text>
                            <Text style={styles.benefitText}>Be kind to future you</Text>
                        </View>
                    </View>
                    <View style={styles.benefitItem}>
                        <View style={[styles.benefitIcon, { backgroundColor: theme.colors.accent + '30' }]}>
                            <Ionicons name="sparkles" size={18} color={theme.colors.accent} />
                        </View>
                        <View style={styles.benefitContent}>
                            <Text style={styles.benefitLabel}>Capture Moments</Text>
                            <Text style={styles.benefitText}>Preserve how you feel now</Text>
                        </View>
                    </View>
                </View>
            </View>

            {/* Sealed Letters */}
            {letters.length > 0 && (
                <View style={styles.lettersSection}>
                    <View style={styles.lettersSectionHeader}>
                        <Text style={styles.lettersSectionTitle}>Your Time Capsules</Text>
                        <View style={styles.lettersCount}>
                            <Text style={styles.lettersCountText}>{letters.length}</Text>
                        </View>
                    </View>
                    
                    {letters.map(letter => {
                        const canOpen = canOpenLetter(letter);
                        const daysLeft = getDaysUntilOpen(letter);
                        
                        return (
                            <TouchableOpacity
                                key={letter.id}
                                style={[styles.letterCard, canOpen && !letter.isOpened && styles.letterCardReady]}
                                onPress={() => canOpen ? openLetter(letter) : null}
                                activeOpacity={canOpen ? 0.8 : 1}
                            >
                                <View style={[styles.letterIconContainer, letter.isOpened && styles.letterIconOpened]}>
                                    {letter.isOpened ? (
                                        <Ionicons name="mail-open" size={24} color={theme.colors.success} />
                                    ) : canOpen ? (
                                        <Ionicons name="gift" size={24} color={theme.colors.primary} />
                                    ) : (
                                        <Ionicons name="lock-closed" size={24} color={theme.colors.textLight} />
                                    )}
                                </View>
                                
                                <View style={styles.letterInfo}>
                                    <Text style={styles.letterDate}>
                                        Written {new Date(letter.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                    </Text>
                                    <Text style={[
                                        styles.letterStatus,
                                        letter.isOpened && styles.letterStatusOpened,
                                        canOpen && !letter.isOpened && styles.letterStatusReady
                                    ]}>
                                        {letter.isOpened 
                                            ? '✨ Opened' 
                                            : canOpen 
                                                ? '🎁 Ready to open!' 
                                                : `🔒 Opens in ${daysLeft} day${daysLeft !== 1 ? 's' : ''}`
                                        }
                                    </Text>
                                </View>
                                
                                {canOpen && !letter.isOpened && (
                                    <View style={styles.openBadge}>
                                        <Text style={styles.openBadgeText}>OPEN</Text>
                                    </View>
                                )}
                            </TouchableOpacity>
                        );
                    })}
                </View>
            )}

            {/* Letter Reading Modal */}
            <Modal visible={!!selectedLetter} transparent animationType="slide">
                <View style={styles.readingOverlay}>
                    <View style={styles.readingCard}>
                        <View style={styles.readingHeader}>
                            <View style={styles.readingHeaderIcon}>
                                <Ionicons name="mail-open" size={24} color={theme.colors.primary} />
                            </View>
                            <Text style={styles.readingTitle}>A Letter from Your Past Self</Text>
                            <TouchableOpacity style={styles.closeButton} onPress={() => setSelectedLetter(null)}>
                                <Ionicons name="close" size={24} color={theme.colors.text} />
                            </TouchableOpacity>
                        </View>
                        
                        <ScrollView style={styles.readingContent} showsVerticalScrollIndicator={false}>
                            {selectedLetter?.prompt && (
                                <View style={styles.readingPromptContainer}>
                                    <Ionicons name="chatbubble-ellipses" size={16} color={theme.colors.textLight} />
                                    <Text style={styles.readingPrompt}>{selectedLetter.prompt}</Text>
                                </View>
                            )}
                            
                            <View style={styles.readingBody}>
                                <Text style={styles.readingText}>{selectedLetter?.content}</Text>
                            </View>
                            
                            <View style={styles.readingMeta}>
                                <Ionicons name="calendar" size={14} color={theme.colors.textLight} />
                                <Text style={styles.readingDate}>
                                    Written on {selectedLetter && new Date(selectedLetter.createdAt).toLocaleDateString('en-US', { 
                                        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
                                    })}
                                </Text>
                            </View>
                        </ScrollView>
                        
                        <View style={styles.readingFooter}>
                            <LinearGradient colors={[theme.colors.primary + '10', theme.colors.primary + '05']} style={styles.readingFooterGradient}>
                                <Text style={styles.readingEncouragement}>💝 You've come so far. Be proud of yourself.</Text>
                            </LinearGradient>
                        </View>
                    </View>
                </View>
            </Modal>

            <View style={{ height: 100 }} />
        </Animated.ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    scrollContent: { paddingBottom: 40 },
    
    // Hero Card
    heroCard: { 
        backgroundColor: theme.colors.card, 
        borderRadius: theme.borderRadius.xl, 
        padding: theme.spacing.xl, 
        alignItems: 'center', 
        marginBottom: theme.spacing.l, 
        ...theme.shadows.card 
    },
    heroEnvelopeContainer: { alignItems: 'center', marginBottom: theme.spacing.l },
    heroEnvelope: { 
        width: 88, height: 88, borderRadius: 44, 
        backgroundColor: theme.colors.primary + '12', 
        justifyContent: 'center', alignItems: 'center', 
        zIndex: 1 
    },
    heroEnvelopeShadow: { 
        position: 'absolute', bottom: -6, width: 60, height: 12, 
        backgroundColor: theme.colors.primary + '10', borderRadius: 30 
    },
    heroEmoji: { fontSize: 42 },
    heroTitle: { 
        fontSize: 26, fontWeight: '800' as const, color: theme.colors.text, 
        letterSpacing: -0.5, marginBottom: theme.spacing.s 
    },
    heroSubtitle: { 
        fontSize: 16, color: theme.colors.textLight, 
        textAlign: 'center', lineHeight: 24, 
        paddingHorizontal: theme.spacing.m, marginBottom: theme.spacing.xl 
    },
    writeButton: { borderRadius: theme.borderRadius.l, overflow: 'hidden', ...theme.shadows.medium },
    writeButtonGradient: { 
        flexDirection: 'row', alignItems: 'center', gap: theme.spacing.s, 
        paddingVertical: theme.spacing.m, paddingHorizontal: theme.spacing.xl 
    },
    writeButtonText: { fontSize: 17, fontWeight: '700' as const, color: '#FFF' },
    
    // Benefits Section
    benefitsSection: { marginBottom: theme.spacing.xl },
    benefitsTitle: { 
        fontSize: 18, fontWeight: '700' as const, color: theme.colors.text, 
        marginBottom: theme.spacing.m 
    },
    benefitsList: { gap: theme.spacing.s },
    benefitItem: { 
        flexDirection: 'row', alignItems: 'center', gap: theme.spacing.m, 
        backgroundColor: theme.colors.card, padding: theme.spacing.m, 
        borderRadius: theme.borderRadius.l, ...theme.shadows.soft 
    },
    benefitIcon: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
    benefitContent: { flex: 1 },
    benefitLabel: { fontSize: 15, fontWeight: '600' as const, color: theme.colors.text },
    benefitText: { fontSize: 13, color: theme.colors.textLight, marginTop: 2 },
    
    // Writing Screen
    writingContainer: { paddingTop: theme.spacing.m },
    writingHeader: { 
        flexDirection: 'row', justifyContent: 'space-between', 
        alignItems: 'center', marginBottom: theme.spacing.l 
    },
    backButton: {},
    backButtonInner: { 
        width: 44, height: 44, borderRadius: 22, 
        backgroundColor: theme.colors.card, 
        justifyContent: 'center', alignItems: 'center', 
        ...theme.shadows.soft 
    },
    writingTitle: { fontSize: 18, fontWeight: '700' as const, color: theme.colors.text },
    
    // Prompt Card
    promptCard: { borderRadius: theme.borderRadius.xl, overflow: 'hidden', marginBottom: theme.spacing.l, ...theme.shadows.soft },
    promptGradient: { padding: theme.spacing.l },
    promptHeader: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.xs, marginBottom: theme.spacing.s },
    promptLabel: { flex: 1, fontSize: 12, fontWeight: '600' as const, color: theme.colors.textLight, textTransform: 'uppercase', letterSpacing: 0.5 },
    shuffleButton: { padding: theme.spacing.xs },
    promptText: { fontSize: 16, color: theme.colors.text, lineHeight: 24, fontStyle: 'italic' },
    
    // Paper
    paperContainer: { marginBottom: theme.spacing.l },
    paper: { 
        backgroundColor: '#FFFEF8', borderRadius: theme.borderRadius.xl, 
        padding: theme.spacing.l, minHeight: 280, 
        borderWidth: 1, borderColor: '#F5F0E5', 
        ...theme.shadows.card 
    },
    paperHeader: { borderBottomWidth: 1, borderBottomColor: '#F0EBE0', paddingBottom: theme.spacing.s, marginBottom: theme.spacing.m },
    paperDate: { fontSize: 12, color: theme.colors.textLight },
    letterInput: { 
        fontSize: 17, color: theme.colors.text, lineHeight: 28, 
        minHeight: 180, textAlignVertical: 'top' 
    },
    paperFooter: { borderTopWidth: 1, borderTopColor: '#F0EBE0', paddingTop: theme.spacing.s, marginTop: theme.spacing.m },
    characterCount: { fontSize: 11, color: theme.colors.textLight, textAlign: 'right' },
    
    // Delivery Section
    deliverySection: { marginBottom: theme.spacing.xl },
    deliveryTitle: { fontSize: 15, fontWeight: '600' as const, color: theme.colors.text, marginBottom: theme.spacing.m },
    deliveryOptions: { flexDirection: 'row', gap: theme.spacing.s },
    deliveryOption: { 
        flex: 1, alignItems: 'center', paddingVertical: theme.spacing.m, 
        backgroundColor: theme.colors.card, borderRadius: theme.borderRadius.l, 
        borderWidth: 2, borderColor: 'transparent', 
        ...theme.shadows.soft 
    },
    deliveryOptionActive: { borderColor: theme.colors.primary, backgroundColor: theme.colors.primary + '08' },
    deliveryEmoji: { fontSize: 24, marginBottom: theme.spacing.xs },
    deliveryLabel: { fontSize: 12, fontWeight: '600' as const, color: theme.colors.textLight },
    deliveryLabelActive: { color: theme.colors.primary },
    
    // Seal Button
    sealButton: { borderRadius: theme.borderRadius.l, overflow: 'hidden', ...theme.shadows.medium },
    sealButtonDisabled: { opacity: 0.6 },
    sealButtonGradient: { 
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center', 
        gap: theme.spacing.s, paddingVertical: theme.spacing.m 
    },
    sealButtonText: { fontSize: 17, fontWeight: '700' as const, color: '#FFF' },
    
    // Sealing Modal
    sealingOverlay: { 
        flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', 
        justifyContent: 'center', alignItems: 'center' 
    },
    envelope: { width: 220, height: 160, position: 'relative', marginBottom: theme.spacing.xl },
    envelopeBody: { 
        position: 'absolute', bottom: 0, width: '100%', height: 110, 
        backgroundColor: '#FAF0E6', borderRadius: 12, 
        justifyContent: 'center', alignItems: 'center',
        ...theme.shadows.large
    },
    envelopePattern: { opacity: 0.5 },
    envelopeFlap: { 
        position: 'absolute', top: 0, alignSelf: 'center',
        width: 0, height: 0, 
        borderLeftWidth: 110, borderRightWidth: 110, borderTopWidth: 80,
        borderLeftColor: 'transparent', borderRightColor: 'transparent', 
        borderTopColor: '#E8D4C4'
    },
    waxSeal: { 
        position: 'absolute', bottom: 30, alignSelf: 'center',
        ...theme.shadows.large 
    },
    waxSealInner: { 
        width: 64, height: 64, borderRadius: 32, 
        backgroundColor: '#C41E3A', justifyContent: 'center', alignItems: 'center',
        borderWidth: 3, borderColor: '#A31830'
    },
    waxSealEmoji: { fontSize: 28 },
    sealingText: { color: '#FFF', fontSize: 20, fontWeight: '700' as const },
    sealingSubtext: { color: 'rgba(255,255,255,0.7)', fontSize: 14, marginTop: theme.spacing.xs },
    
    // Letters Section
    lettersSection: { marginTop: theme.spacing.m },
    lettersSectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: theme.spacing.m },
    lettersSectionTitle: { fontSize: 18, fontWeight: '700' as const, color: theme.colors.text },
    lettersCount: { 
        width: 28, height: 28, borderRadius: 14, 
        backgroundColor: theme.colors.primary + '15', 
        justifyContent: 'center', alignItems: 'center' 
    },
    lettersCountText: { fontSize: 13, fontWeight: '700' as const, color: theme.colors.primary },
    letterCard: { 
        flexDirection: 'row', alignItems: 'center', 
        backgroundColor: theme.colors.card, borderRadius: theme.borderRadius.l, 
        padding: theme.spacing.m, marginBottom: theme.spacing.s, 
        borderWidth: 2, borderColor: 'transparent',
        ...theme.shadows.soft 
    },
    letterCardReady: { borderColor: theme.colors.primary, backgroundColor: theme.colors.primary + '05' },
    letterIconContainer: { 
        width: 50, height: 50, borderRadius: 25, 
        backgroundColor: theme.colors.background, 
        justifyContent: 'center', alignItems: 'center' 
    },
    letterIconOpened: { backgroundColor: theme.colors.success + '15' },
    letterInfo: { flex: 1, marginLeft: theme.spacing.m },
    letterDate: { fontSize: 15, color: theme.colors.text, fontWeight: '600' as const },
    letterStatus: { fontSize: 13, color: theme.colors.textLight, marginTop: 4 },
    letterStatusOpened: { color: theme.colors.success },
    letterStatusReady: { color: theme.colors.primary, fontWeight: '600' as const },
    openBadge: { 
        backgroundColor: theme.colors.primary, 
        paddingHorizontal: theme.spacing.s, paddingVertical: 6, 
        borderRadius: theme.borderRadius.xs 
    },
    openBadgeText: { fontSize: 11, color: '#FFF', fontWeight: '800' as const, letterSpacing: 0.5 },
    
    // Reading Modal
    readingOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    readingCard: { 
        backgroundColor: theme.colors.card, 
        borderTopLeftRadius: theme.borderRadius.xl, 
        borderTopRightRadius: theme.borderRadius.xl, 
        maxHeight: SCREEN_HEIGHT * 0.85, 
        ...theme.shadows.large
    },
    readingHeader: { 
        flexDirection: 'row', alignItems: 'center', 
        padding: theme.spacing.l, paddingBottom: theme.spacing.m,
        borderBottomWidth: 1, borderBottomColor: theme.colors.border 
    },
    readingHeaderIcon: { 
        width: 44, height: 44, borderRadius: 22, 
        backgroundColor: theme.colors.primary + '10', 
        justifyContent: 'center', alignItems: 'center', marginRight: theme.spacing.m 
    },
    readingTitle: { flex: 1, fontSize: 17, fontWeight: '700' as const, color: theme.colors.text },
    closeButton: { padding: theme.spacing.xs },
    readingContent: { padding: theme.spacing.l, maxHeight: SCREEN_HEIGHT * 0.5 },
    readingPromptContainer: { 
        flexDirection: 'row', alignItems: 'flex-start', gap: theme.spacing.s,
        backgroundColor: theme.colors.background, padding: theme.spacing.m, 
        borderRadius: theme.borderRadius.m, marginBottom: theme.spacing.l 
    },
    readingPrompt: { flex: 1, fontSize: 14, color: theme.colors.textLight, fontStyle: 'italic', lineHeight: 20 },
    readingBody: { marginBottom: theme.spacing.l },
    readingText: { fontSize: 18, color: theme.colors.text, lineHeight: 32 },
    readingMeta: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.xs },
    readingDate: { fontSize: 12, color: theme.colors.textLight },
    readingFooter: { borderTopWidth: 1, borderTopColor: theme.colors.border },
    readingFooterGradient: { padding: theme.spacing.l, alignItems: 'center' },
    readingEncouragement: { fontSize: 16, color: theme.colors.primary, fontWeight: '600' as const, textAlign: 'center' },
});

export default LetterToSelf;
