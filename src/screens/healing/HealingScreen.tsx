import React, { useState, useRef, useEffect } from 'react';
import { 
    View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Image, 
    ActivityIndicator, Dimensions, TextInput, KeyboardAvoidingView, Platform, Animated
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { Ionicons } from '@expo/vector-icons';
import ScreenWrapper from '../../components/ScreenWrapper';
import { useAppStore } from '../../state/store';
import { theme } from '../../theme';
import { GeminiService } from '../../services/gemini/client';
import { VoiceJournalEntry, HealedMemory, HealingChatMessage } from '../../types';
import { ProgressDashboard } from '../../components/ProgressDashboard';
import { BreathingExercise } from '../../components/BreathingExercise';
import { LetterToSelf } from '../../components/LetterToSelf';
import { HealingRituals } from '../../components/HealingRituals';
import { EmotionColorWheel } from '../../components/EmotionColorWheel';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type HealingTab = 'progress' | 'rituals' | 'letter' | 'emotions' | 'journal' | 'memories' | 'chat' | 'mood';

export default function HealingScreen() {
    const [activeTab, setActiveTab] = useState<HealingTab>('progress');
    
    return (
        <ScreenWrapper>
            <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={90}>
                {/* Header with Quick Stats */}
                <View style={styles.header}>
                    <Text style={styles.title}>Healing Journey</Text>
                    <Text style={styles.subtitle}>Your safe space to process and grow</Text>
                </View>

                {/* Tab Switcher */}
                <View style={styles.tabContainer}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabScroll}>
                        <TabButton icon="analytics" label="Progress" isActive={activeTab === 'progress'} onPress={() => setActiveTab('progress')} />
                        <TabButton icon="sparkles" label="Rituals" isActive={activeTab === 'rituals'} onPress={() => setActiveTab('rituals')} />
                        <TabButton icon="mail" label="Letter" isActive={activeTab === 'letter'} onPress={() => setActiveTab('letter')} />
                        <TabButton icon="color-palette" label="Emotions" isActive={activeTab === 'emotions'} onPress={() => setActiveTab('emotions')} />
                        <TabButton icon="journal" label="Journal" isActive={activeTab === 'journal'} onPress={() => setActiveTab('journal')} />
                        <TabButton icon="images" label="Memories" isActive={activeTab === 'memories'} onPress={() => setActiveTab('memories')} />
                        <TabButton icon="chatbubbles" label="AI Chat" isActive={activeTab === 'chat'} onPress={() => setActiveTab('chat')} />
                        <TabButton icon="heart" label="Mood" isActive={activeTab === 'mood'} onPress={() => setActiveTab('mood')} />
                    </ScrollView>
                </View>

                {/* Tab Content */}
                {activeTab === 'progress' && <ProgressTab />}
                {activeTab === 'rituals' && <HealingRituals />}
                {activeTab === 'letter' && <LetterToSelf />}
                {activeTab === 'emotions' && <EmotionColorWheel />}
                {activeTab === 'journal' && <VoiceJournalingTab />}
                {activeTab === 'memories' && <MemoryReframingTab />}
                {activeTab === 'chat' && <HealingChatTab />}
                {activeTab === 'mood' && <MoodTrackingTab />}
            </KeyboardAvoidingView>
        </ScreenWrapper>
    );
}

// TAB BUTTON
const TabButton: React.FC<{ icon: keyof typeof Ionicons.glyphMap; label: string; isActive: boolean; onPress: () => void }> = ({ icon, label, isActive, onPress }) => (
    <TouchableOpacity style={[styles.tabButton, isActive && styles.tabButtonActive]} onPress={onPress} activeOpacity={0.7}>
        <Ionicons name={icon} size={18} color={isActive ? '#FFF' : theme.colors.textLight} />
        <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>{label}</Text>
    </TouchableOpacity>
);

// PROGRESS TAB - NEW!
const ProgressTab: React.FC = () => {
    return (
        <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
            {/* Breathing Exercise */}
            <BreathingExercise />
            
            <View style={{ height: 16 }} />
            
            {/* Progress Dashboard */}
            <ProgressDashboard />
            
            <View style={{ height: 100 }} />
        </ScrollView>
    );
};

// VOICE JOURNALING TAB (Text-based for stability)
const VoiceJournalingTab: React.FC = () => {
    const { voiceJournals, addVoiceJournal } = useAppStore();
    const [journalText, setJournalText] = useState('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [currentAnalysis, setCurrentAnalysis] = useState<VoiceJournalEntry | null>(null);

    const analyzeJournal = async () => {
        if (!journalText.trim()) {
            Alert.alert('Empty Entry', 'Please write something about how you are feeling.');
            return;
        }
        
        if (!GeminiService.isConfigured()) {
            Alert.alert('API Key Required', 'Please add your Gemini API key.');
            return;
        }

        setIsAnalyzing(true);
        try {
            // Use text generation instead of audio analysis
            const prompt = 'Analyze this journal entry from someone healing from a breakup: "' + journalText + '". Return JSON: { "transcription": "' + journalText + '", "detectedEmotions": ["emotion1", "emotion2"], "emotionIntensity": 5, "voiceToneAnalysis": "written reflection", "keyThemes": ["theme1"], "insights": "supportive insight", "affirmation": "personalized affirmation", "suggestion": "healing suggestion" }';
            
            const response = await GeminiService.generateText(prompt);
            const jsonStr = response.replace(/```json/g, '').replace(/```/g, '').trim();
            const parsed = JSON.parse(jsonStr);

            const entry: VoiceJournalEntry = {
                id: 'journal_' + Date.now(), 
                date: new Date().toISOString(), 
                duration: 0,
                transcription: journalText,
                detectedEmotions: parsed.detectedEmotions || ['reflective'],
                emotionIntensity: parsed.emotionIntensity || 5, 
                voiceToneAnalysis: parsed.voiceToneAnalysis || 'written reflection',
                keyThemes: parsed.keyThemes || [], 
                insights: parsed.insights || 'Thank you for sharing.',
                affirmation: parsed.affirmation || 'Your feelings are valid.', 
                suggestion: parsed.suggestion || 'Take it one day at a time.',
            };
            setCurrentAnalysis(entry);
            addVoiceJournal(entry);
            setJournalText('');
            
        } catch (e: any) {
            console.error('Journal analysis error:', e);
            Alert.alert('Analysis Error', e.message || 'Could not analyze your entry.');
        } finally {
            setIsAnalyzing(false);
        }
    };

    return (
        <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
            <View style={styles.card}>
                <View style={styles.cardHeader}>
                    <Ionicons name="journal" size={24} color={theme.colors.primary} />
                    <Text style={styles.cardTitle}>Journal Entry</Text>
                </View>
                <Text style={styles.cardSubtitle}>Write about how you are feeling. AI will provide insights and support.</Text>

                {isAnalyzing ? (
                    <View style={styles.centerContainer}>
                        <ActivityIndicator size="large" color={theme.colors.primary} />
                        <Text style={styles.statusText}>Analyzing your feelings...</Text>
                    </View>
                ) : currentAnalysis ? (
                    <View style={styles.analysisResult}>
                        <View style={styles.emotionBadges}>
                            {currentAnalysis.detectedEmotions.map((e, i) => (
                                <View key={i} style={styles.emotionBadge}><Text style={styles.emotionBadgeText}>{e}</Text></View>
                            ))}
                        </View>
                        <Text style={styles.label}>What you wrote:</Text>
                        <Text style={styles.transcription}>"{currentAnalysis.transcription}"</Text>
                        <View style={styles.insightBox}>
                            <Ionicons name="bulb" size={20} color={theme.colors.accent} />
                            <Text style={styles.insightText}>{currentAnalysis.insights}</Text>
                        </View>
                        <View style={styles.affirmationBox}>
                            <Text style={styles.affirmationText}>{currentAnalysis.affirmation}</Text>
                        </View>
                        <TouchableOpacity style={styles.primaryBtn} onPress={() => setCurrentAnalysis(null)}>
                            <Text style={styles.primaryBtnText}>Write Another Entry</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <View>
                        <TextInput
                            style={[styles.textInput, { minHeight: 150 }]}
                            placeholder="How are you feeling today? What's on your mind?"
                            placeholderTextColor={theme.colors.textLight}
                            value={journalText}
                            onChangeText={setJournalText}
                            multiline
                            textAlignVertical="top"
                        />
                        <TouchableOpacity 
                            style={[styles.primaryBtn, { marginTop: 16, alignSelf: 'center' }]} 
                            onPress={analyzeJournal}
                            disabled={!journalText.trim()}
                        >
                            <Text style={styles.primaryBtnText}>Analyze My Feelings</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>

            {voiceJournals.length > 0 && (
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Past Entries</Text>
                    {voiceJournals.slice(0, 5).map((j) => (
                        <View key={j.id} style={styles.listItem}>
                            <Text style={styles.listItemDate}>{new Date(j.date).toLocaleDateString()}</Text>
                            <Text style={styles.listItemText} numberOfLines={2}>{j.transcription}</Text>
                        </View>
                    ))}
                </View>
            )}
            <View style={{ height: 100 }} />
        </ScrollView>
    );
};


// MEMORY REFRAMING TAB
const MemoryReframingTab: React.FC = () => {
    const { healedMemories, addHealedMemory } = useAppStore();
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [userContext, setUserContext] = useState('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [currentMemory, setCurrentMemory] = useState<HealedMemory | null>(null);

    const pickImage = async () => {
        const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permission.granted) { Alert.alert('Permission Denied'); return; }
        const result = await ImagePicker.launchImageLibraryAsync({ allowsEditing: true, quality: 0.7, base64: true });
        if (!result.canceled) setSelectedImage(result.assets[0].uri);
    };

    const analyzeMemory = async () => {
        if (!selectedImage || !GeminiService.isConfigured()) { Alert.alert('Error', 'API key required.'); return; }
        setIsAnalyzing(true);
        try {
            const base64 = await FileSystem.readAsStringAsync(selectedImage, { encoding: 'base64' });
            const response = await GeminiService.analyzeMemoryPhoto(base64, userContext);
            const parsed = JSON.parse(response.replace(/```json/g, '').replace(/```/g, '').trim());

            const memory: HealedMemory = {
                id: `memory_${Date.now()}`, date: new Date().toISOString(), imageUri: selectedImage, userContext,
                photoDescription: parsed.photoDescription || '', emotionalAcknowledgment: parsed.emotionalAcknowledgment || '',
                reframingQuestions: parsed.reframingQuestions || [], positiveExtraction: parsed.positiveExtraction || '',
                healedPerspective: parsed.healedPerspective || '', closingAffirmation: parsed.closingAffirmation || '',
                isProcessed: true,
            };
            setCurrentMemory(memory);
            addHealedMemory(memory);
        } catch (e: any) {
            Alert.alert('Analysis Failed', e.message);
        } finally {
            setIsAnalyzing(false);
        }
    };

    const reset = () => { setSelectedImage(null); setUserContext(''); setCurrentMemory(null); };

    return (
        <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
            <View style={styles.card}>
                <View style={styles.cardHeader}>
                    <Ionicons name="images" size={24} color={theme.colors.secondary} />
                    <Text style={styles.cardTitle}>Memory Reframing</Text>
                </View>
                <Text style={styles.cardSubtitle}>Choose a photo from your past. AI will help you process and find growth.</Text>

                {!selectedImage ? (
                    <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
                        <Ionicons name="images-outline" size={48} color={theme.colors.secondary} />
                        <Text style={styles.imagePickerText}>Choose a Photo</Text>
                    </TouchableOpacity>
                ) : isAnalyzing ? (
                    <View style={styles.centerContainer}>
                        <Image source={{ uri: selectedImage }} style={styles.memoryImageSmall} />
                        <ActivityIndicator size="large" color={theme.colors.secondary} style={{ marginTop: 20 }} />
                        <Text style={styles.statusText}>Processing with care...</Text>
                    </View>
                ) : currentMemory ? (
                    <View>
                        <Image source={{ uri: selectedImage }} style={styles.memoryImage} />
                        <View style={styles.highlightBox}><Text style={styles.highlightText}>{currentMemory.emotionalAcknowledgment}</Text></View>
                        <View style={styles.positiveBox}><Text style={styles.positiveLabel}>✨ What you can take:</Text><Text style={styles.positiveText}>{currentMemory.positiveExtraction}</Text></View>
                        <View style={styles.healedBox}><Text style={styles.healedLabel}>🌱 Healed Perspective:</Text><Text style={styles.healedText}>{currentMemory.healedPerspective}</Text></View>
                        <Text style={styles.closingAffirmation}>{currentMemory.closingAffirmation}</Text>
                        <TouchableOpacity style={styles.secondaryBtn} onPress={reset}><Text style={styles.secondaryBtnText}>Process Another</Text></TouchableOpacity>
                    </View>
                ) : (
                    <View style={styles.centerContainer}>
                        <Image source={{ uri: selectedImage }} style={styles.memoryImageSmall} />
                        <Text style={styles.label}>Context (optional):</Text>
                        <TextInput style={styles.textInput} placeholder="What does this memory mean?" placeholderTextColor={theme.colors.textLight} value={userContext} onChangeText={setUserContext} multiline />
                        <TouchableOpacity style={styles.secondaryBtn} onPress={analyzeMemory}><Text style={styles.secondaryBtnText}>Begin Healing Exercise</Text></TouchableOpacity>
                        <TouchableOpacity onPress={reset}><Text style={styles.cancelText}>Choose Different Photo</Text></TouchableOpacity>
                    </View>
                )}
            </View>
            <View style={{ height: 100 }} />
        </ScrollView>
    );
};

// HEALING CHAT TAB
const HealingChatTab: React.FC = () => {
    const { currentHealingChat, startHealingChat, addHealingChatMessage, getHealingDays, getRecentMoods, getRecentJournalThemes } = useAppStore();
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const scrollRef = useRef<ScrollView>(null);

    useEffect(() => { if (!currentHealingChat) startHealingChat(); }, []);
    useEffect(() => { setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100); }, [currentHealingChat?.messages.length]);

    const sendMessage = async () => {
        if (!message.trim() || isLoading || !GeminiService.isConfigured()) return;
        const userMsg: HealingChatMessage = { id: `msg_${Date.now()}`, role: 'user', content: message.trim(), timestamp: new Date().toISOString() };
        addHealingChatMessage(userMsg);
        setMessage('');
        setIsLoading(true);

        try {
            const history = currentHealingChat?.messages.map(m => ({ role: m.role, content: m.content })) || [];
            const response = await GeminiService.healingChat(userMsg.content, history, {
                healingDays: getHealingDays(), recentMoods: getRecentMoods(7), recentJournalThemes: getRecentJournalThemes()
            });
            addHealingChatMessage({ id: `msg_${Date.now()}_ai`, role: 'assistant', content: response, timestamp: new Date().toISOString() });
        } catch (e: any) {
            Alert.alert('Error', e.message);
        } finally {
            setIsLoading(false);
        }
    };

    const prompts = ["I'm feeling lonely", "I keep thinking about them", "I had a good day"];

    return (
        <View style={styles.chatContainer}>
            <ScrollView ref={scrollRef} style={styles.chatMessages} contentContainerStyle={styles.chatMessagesContent}>
                {(!currentHealingChat || !currentHealingChat.messages.length) && (
                    <View style={styles.welcomeContainer}>
                        <View style={styles.aiAvatar}><Ionicons name="heart" size={32} color={theme.colors.primary} /></View>
                        <Text style={styles.welcomeTitle}>I'm here for you</Text>
                        <Text style={styles.welcomeText}>This is a safe space to share your feelings.</Text>
                        <View style={styles.promptsContainer}>
                            {prompts.map((p, i) => (
                                <TouchableOpacity key={i} style={styles.promptButton} onPress={() => setMessage(p)}>
                                    <Text style={styles.promptText}>{p}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                )}
                {currentHealingChat?.messages.map((m) => (
                    <View key={m.id} style={[styles.msgBubble, m.role === 'user' ? styles.userMsg : styles.aiMsg]}>
                        <Text style={[styles.msgText, m.role === 'user' && styles.userMsgText]}>{m.content}</Text>
                    </View>
                ))}
                {isLoading && <View style={[styles.msgBubble, styles.aiMsg]}><ActivityIndicator size="small" color={theme.colors.primary} /></View>}
            </ScrollView>
            <View style={styles.chatInputContainer}>
                <TextInput style={styles.chatInput} placeholder="Share what's on your mind..." placeholderTextColor={theme.colors.textLight} value={message} onChangeText={setMessage} multiline maxLength={1000} />
                <TouchableOpacity style={[styles.sendBtn, !message.trim() && styles.sendBtnDisabled]} onPress={sendMessage} disabled={!message.trim() || isLoading}>
                    <Ionicons name="send" size={20} color={message.trim() ? '#FFF' : theme.colors.textLight} />
                </TouchableOpacity>
            </View>
        </View>
    );
};

// MOOD TRACKING TAB
const MoodTrackingTab: React.FC = () => {
    const { moodLogs, logMood, completedTasks, toggleTaskCompletion, todayAffirmation, setTodayAffirmation } = useAppStore();
    const [todaysMood, setTodaysMood] = useState<number | null>(null);
    const [loadingAff, setLoadingAff] = useState(false);

    const MOODS = [
        { value: 1, emoji: '😢', label: 'Rough', color: '#FF7675' },
        { value: 2, emoji: '😕', label: 'Cloudy', color: '#FDCB6E' },
        { value: 3, emoji: '😐', label: 'Okay', color: '#74B9FF' },
        { value: 4, emoji: '🙂', label: 'Good', color: '#55EFC4' },
        { value: 5, emoji: '🤩', label: 'Great', color: '#A29BFE' },
    ];
    const TASKS = [
        { id: 't1', title: 'Write 3 things you\'re grateful for', desc: 'Gratitude shifts perspective' },
        { id: 't2', title: 'Take a 10-minute walk', desc: 'Movement helps process emotions' },
        { id: 't3', title: 'Reach out to a friend', desc: 'Connection is healing' },
    ];

    const handleMoodSelect = async (value: number) => {
        setTodaysMood(value);
        logMood({ id: `mood_${Date.now()}`, date: new Date().toISOString(), value: value as 1|2|3|4|5 });
        if (GeminiService.isConfigured()) {
            setLoadingAff(true);
            try {
                const aff = await GeminiService.generateAffirmation(value);
                setTodayAffirmation({ id: `aff_${Date.now()}`, date: new Date().toISOString(), text: aff, mood: value });
            } catch (e) { console.log(e); } finally { setLoadingAff(false); }
        }
    };

    return (
        <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
            <View style={styles.card}>
                <View style={styles.cardHeader}><Ionicons name="heart" size={24} color={theme.colors.primary} /><Text style={styles.cardTitle}>How are you feeling?</Text></View>
                {todaysMood ? (
                    <View style={styles.centerContainer}>
                        <Text style={{ fontSize: 64 }}>{MOODS.find(m => m.value === todaysMood)?.emoji}</Text>
                        <Text style={styles.moodResultText}>{MOODS.find(m => m.value === todaysMood)?.label}</Text>
                        {loadingAff ? <ActivityIndicator size="small" color={theme.colors.primary} style={{ marginTop: 16 }} /> : todayAffirmation && (
                            <View style={styles.affirmationBox}><Text style={styles.affirmationText}>💝 {todayAffirmation.text}</Text></View>
                        )}
                        <TouchableOpacity style={styles.changeMoodBtn} onPress={() => setTodaysMood(null)}><Text style={styles.changeMoodBtnText}>Change</Text></TouchableOpacity>
                    </View>
                ) : (
                    <View style={styles.moodSelector}>
                        {MOODS.map((m) => (
                            <TouchableOpacity key={m.value} style={styles.moodOption} onPress={() => handleMoodSelect(m.value)}>
                                <View style={[styles.moodCircle, { backgroundColor: m.color + '20', borderColor: m.color }]}><Text style={{ fontSize: 28 }}>{m.emoji}</Text></View>
                                <Text style={styles.moodLabel}>{m.label}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                )}
            </View>

            <View style={styles.card}>
                <View style={styles.cardHeader}><Text style={styles.cardTitle}>Healing Steps</Text><View style={styles.progressBadge}><Text style={styles.progressBadgeText}>{completedTasks.length}/{TASKS.length}</Text></View></View>
                {TASKS.map((t) => {
                    const done = completedTasks.includes(t.id);
                    return (
                        <TouchableOpacity key={t.id} style={[styles.taskItem, done && styles.taskItemDone]} onPress={() => toggleTaskCompletion(t.id)}>
                            <View style={[styles.taskCheck, done && styles.taskCheckDone]}>{done && <Ionicons name="checkmark" size={16} color="#FFF" />}</View>
                            <View style={{ flex: 1 }}><Text style={[styles.taskTitle, done && styles.taskTitleDone]}>{t.title}</Text><Text style={styles.taskDesc}>{t.desc}</Text></View>
                        </TouchableOpacity>
                    );
                })}
            </View>
            <View style={{ height: 100 }} />
        </ScrollView>
    );
};

// STYLES
const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { marginBottom: theme.spacing.m },
    title: { ...theme.typography.h1, color: theme.colors.text, fontWeight: '800' },
    subtitle: { ...theme.typography.body, color: theme.colors.textLight, marginTop: theme.spacing.xs },
    tabContainer: { marginBottom: theme.spacing.l },
    tabScroll: { gap: theme.spacing.s },
    tabButton: { flexDirection: 'row', alignItems: 'center', paddingVertical: theme.spacing.m, paddingHorizontal: theme.spacing.l, borderRadius: theme.borderRadius.l, backgroundColor: theme.colors.card, gap: theme.spacing.s, ...theme.shadows.soft },
    tabButtonActive: { backgroundColor: theme.colors.primary },
    tabLabel: { ...theme.typography.button, color: theme.colors.textLight },
    tabLabelActive: { color: '#FFF' },
    tabContent: { flex: 1 },
    card: { backgroundColor: theme.colors.card, borderRadius: theme.borderRadius.xl, padding: theme.spacing.xl, marginBottom: theme.spacing.l, ...theme.shadows.card },
    cardHeader: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.s, marginBottom: theme.spacing.s },
    cardTitle: { ...theme.typography.h3, color: theme.colors.text, fontWeight: '700', flex: 1 },
    cardSubtitle: { ...theme.typography.body, color: theme.colors.textLight, marginBottom: theme.spacing.xl },
    centerContainer: { alignItems: 'center', paddingVertical: theme.spacing.xl },
    statusText: { ...theme.typography.body, color: theme.colors.textLight, marginTop: theme.spacing.m },
    label: { ...theme.typography.caption, color: theme.colors.textLight, marginBottom: theme.spacing.xs, alignSelf: 'flex-start', marginTop: theme.spacing.l },
    recordingArea: { alignItems: 'center', paddingVertical: theme.spacing.xl },
    recordButton: { width: 120, height: 120, borderRadius: 60, backgroundColor: theme.colors.primary, justifyContent: 'center', alignItems: 'center', ...theme.shadows.large },
    recordButtonActive: { backgroundColor: theme.colors.error },
    analysisResult: { width: '100%' },
    emotionBadges: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.s, marginBottom: theme.spacing.l, justifyContent: 'center' },
    emotionBadge: { backgroundColor: theme.colors.primary + '20', paddingHorizontal: theme.spacing.m, paddingVertical: theme.spacing.s, borderRadius: theme.borderRadius.l },
    emotionBadgeText: { ...theme.typography.caption, color: theme.colors.primary, fontWeight: '700' },
    transcription: { ...theme.typography.body, color: theme.colors.text, fontStyle: 'italic', marginBottom: theme.spacing.l, lineHeight: 24 },
    insightBox: { flexDirection: 'row', backgroundColor: theme.colors.accent + '15', padding: theme.spacing.m, borderRadius: theme.borderRadius.m, gap: theme.spacing.s, marginBottom: theme.spacing.m },
    insightText: { ...theme.typography.body, color: theme.colors.text, flex: 1 },
    affirmationBox: { backgroundColor: theme.colors.primary + '10', padding: theme.spacing.l, borderRadius: theme.borderRadius.m, marginBottom: theme.spacing.l, borderLeftWidth: 4, borderLeftColor: theme.colors.primary },
    affirmationText: { ...theme.typography.body, color: theme.colors.text, fontWeight: '600', lineHeight: 24 },
    primaryBtn: { backgroundColor: theme.colors.primary, paddingVertical: theme.spacing.m, paddingHorizontal: theme.spacing.xl, borderRadius: theme.borderRadius.m, alignSelf: 'center' },
    primaryBtnText: { ...theme.typography.button, color: '#FFF' },
    secondaryBtn: { backgroundColor: theme.colors.secondary, paddingVertical: theme.spacing.m, paddingHorizontal: theme.spacing.xl, borderRadius: theme.borderRadius.m, alignSelf: 'center', marginTop: theme.spacing.l },
    secondaryBtnText: { ...theme.typography.button, color: '#FFF' },
    listItem: { backgroundColor: theme.colors.background, padding: theme.spacing.m, borderRadius: theme.borderRadius.m, marginTop: theme.spacing.m },
    listItemDate: { ...theme.typography.caption, color: theme.colors.textLight, marginBottom: theme.spacing.xs },
    listItemText: { ...theme.typography.caption, color: theme.colors.text },
    imagePicker: { alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.secondary + '10', borderRadius: theme.borderRadius.l, borderWidth: 2, borderStyle: 'dashed', borderColor: theme.colors.secondary, paddingVertical: theme.spacing.xxl },
    imagePickerText: { ...theme.typography.button, color: theme.colors.secondary, marginTop: theme.spacing.m },
    memoryImageSmall: { width: 120, height: 120, borderRadius: theme.borderRadius.m },
    memoryImage: { width: '100%', height: 200, borderRadius: theme.borderRadius.m, marginBottom: theme.spacing.l },
    textInput: { width: '100%', backgroundColor: theme.colors.background, borderRadius: theme.borderRadius.m, padding: theme.spacing.m, ...theme.typography.body, color: theme.colors.text, minHeight: 80, textAlignVertical: 'top' },
    cancelText: { ...theme.typography.caption, color: theme.colors.textLight, marginTop: theme.spacing.m },
    highlightBox: { backgroundColor: theme.colors.primary + '10', padding: theme.spacing.m, borderRadius: theme.borderRadius.m, marginBottom: theme.spacing.l },
    highlightText: { ...theme.typography.body, color: theme.colors.text, fontStyle: 'italic' },
    positiveBox: { backgroundColor: theme.colors.success + '15', padding: theme.spacing.l, borderRadius: theme.borderRadius.m, marginBottom: theme.spacing.m },
    positiveLabel: { ...theme.typography.caption, color: theme.colors.success, fontWeight: '700', marginBottom: theme.spacing.s },
    positiveText: { ...theme.typography.body, color: theme.colors.text },
    healedBox: { backgroundColor: theme.colors.secondary + '15', padding: theme.spacing.l, borderRadius: theme.borderRadius.m, marginBottom: theme.spacing.l },
    healedLabel: { ...theme.typography.caption, color: theme.colors.secondary, fontWeight: '700', marginBottom: theme.spacing.s },
    healedText: { ...theme.typography.body, color: theme.colors.text },
    closingAffirmation: { ...theme.typography.bodyLarge, color: theme.colors.primary, textAlign: 'center', fontWeight: '600', marginBottom: theme.spacing.l },
    chatContainer: { flex: 1 },
    chatMessages: { flex: 1 },
    chatMessagesContent: { padding: theme.spacing.m, paddingBottom: theme.spacing.xl },
    welcomeContainer: { alignItems: 'center', paddingVertical: theme.spacing.xl },
    aiAvatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: theme.colors.primary + '15', justifyContent: 'center', alignItems: 'center', marginBottom: theme.spacing.l },
    welcomeTitle: { ...theme.typography.h2, color: theme.colors.text, fontWeight: '700', marginBottom: theme.spacing.s },
    welcomeText: { ...theme.typography.body, color: theme.colors.textLight, textAlign: 'center', paddingHorizontal: theme.spacing.l, marginBottom: theme.spacing.xl },
    promptsContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: theme.spacing.s },
    promptButton: { backgroundColor: theme.colors.card, paddingVertical: theme.spacing.s, paddingHorizontal: theme.spacing.m, borderRadius: theme.borderRadius.l, borderWidth: 1, borderColor: theme.colors.border },
    promptText: { ...theme.typography.caption, color: theme.colors.text },
    msgBubble: { maxWidth: '80%', padding: theme.spacing.m, borderRadius: theme.borderRadius.l, marginBottom: theme.spacing.m },
    userMsg: { alignSelf: 'flex-end', backgroundColor: theme.colors.primary, borderBottomRightRadius: theme.borderRadius.xs },
    aiMsg: { alignSelf: 'flex-start', backgroundColor: theme.colors.card, borderBottomLeftRadius: theme.borderRadius.xs, borderWidth: 1, borderColor: theme.colors.border },
    msgText: { ...theme.typography.body, color: theme.colors.text, lineHeight: 22 },
    userMsgText: { color: '#FFF' },
    chatInputContainer: { flexDirection: 'row', alignItems: 'flex-end', padding: theme.spacing.m, backgroundColor: theme.colors.card, borderTopWidth: 1, borderTopColor: theme.colors.border, gap: theme.spacing.s },
    chatInput: { flex: 1, ...theme.typography.body, color: theme.colors.text, backgroundColor: theme.colors.background, borderRadius: theme.borderRadius.m, paddingHorizontal: theme.spacing.m, paddingVertical: theme.spacing.m, maxHeight: 100, borderWidth: 1, borderColor: theme.colors.border },
    sendBtn: { width: 48, height: 48, borderRadius: 24, backgroundColor: theme.colors.primary, justifyContent: 'center', alignItems: 'center' },
    sendBtnDisabled: { backgroundColor: theme.colors.border },
    moodSelector: { flexDirection: 'row', justifyContent: 'space-around' },
    moodOption: { alignItems: 'center' },
    moodCircle: { width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center', borderWidth: 2, marginBottom: theme.spacing.xs },
    moodLabel: { ...theme.typography.captionSmall, color: theme.colors.textLight },
    moodResultText: { ...theme.typography.h4, color: theme.colors.text, marginTop: theme.spacing.s },
    changeMoodBtn: { backgroundColor: theme.colors.border, paddingVertical: theme.spacing.s, paddingHorizontal: theme.spacing.l, borderRadius: theme.borderRadius.m, marginTop: theme.spacing.m },
    changeMoodBtnText: { ...theme.typography.caption, color: theme.colors.textLight },
    progressBadge: { backgroundColor: theme.colors.success, paddingHorizontal: theme.spacing.m, paddingVertical: theme.spacing.xs, borderRadius: theme.borderRadius.l },
    progressBadgeText: { ...theme.typography.captionSmall, color: '#FFF', fontWeight: '700' },
    taskItem: { flexDirection: 'row', alignItems: 'flex-start', padding: theme.spacing.m, backgroundColor: theme.colors.background, borderRadius: theme.borderRadius.m, marginTop: theme.spacing.s },
    taskItemDone: { opacity: 0.7 },
    taskCheck: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: theme.colors.border, marginRight: theme.spacing.m, justifyContent: 'center', alignItems: 'center' },
    taskCheckDone: { backgroundColor: theme.colors.success, borderColor: theme.colors.success },
    taskTitle: { ...theme.typography.body, color: theme.colors.text, fontWeight: '600', marginBottom: 2 },
    taskTitleDone: { textDecorationLine: 'line-through', color: theme.colors.textLight },
    taskDesc: { ...theme.typography.caption, color: theme.colors.textLight },
});
