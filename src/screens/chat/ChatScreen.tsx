import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TextInput,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    Dimensions,
    Alert,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import ScreenWrapper from '../../components/ScreenWrapper';
import MyCard from '../../components/MyCard';
import { useAppStore } from '../../state/store';
import { theme } from '../../theme';
import { ChatMessage } from '../../types';
import { CONVERSATION_STARTERS, getIntimateStarters } from '../../utils/conversationStarters';

const { width } = Dimensions.get('window');

export default function ChatScreen() {
    const route = useRoute();
    const navigation = useNavigation();
    const { matchId } = route.params as { matchId: string };

    const { matches, chatMessages, addChatMessage } = useAppStore();
    const [messageText, setMessageText] = useState('');
    const [showStarters, setShowStarters] = useState(true);
    const scrollViewRef = useRef<ScrollView>(null);

    const match = matches.find(m => m.id === matchId);
    const messages = chatMessages.filter(m => m.matchId === matchId);
    const intimateStarters = getIntimateStarters();

    useEffect(() => {
        if (match) {
            navigation.setOptions({
                title: match.matchProfile.name,
                headerShown: true,
                headerStyle: {
                    backgroundColor: theme.colors.card,
                },
                headerTintColor: theme.colors.text,
            });
        }
    }, [match, navigation]);

    useEffect(() => {
        // Auto-scroll to bottom when new message arrives
        setTimeout(() => {
            scrollViewRef.current?.scrollToEnd({ animated: true });
        }, 100);
    }, [messages.length]);

    const sendMessage = (text: string, type: 'text' | 'suggestion' | 'icebreaker' = 'text') => {
        if (!text.trim() || !match) return;

        const newMessage: ChatMessage = {
            id: `msg_${Date.now()}`,
            matchId: matchId,
            senderId: 'user',
            text: text.trim(),
            timestamp: new Date().toISOString(),
            type,
        };

        addChatMessage(newMessage);
        setMessageText('');
        setShowStarters(false);

        // Simulate response after 1-2 seconds
        setTimeout(() => {
            const responses = [
                'That\'s really interesting! Tell me more 💭',
                'I love that! We should explore that together 🌟',
                'You\'re so thoughtful. I appreciate you sharing that 💕',
                'That resonates with me. I feel the same way sometimes 💝',
            ];
            const randomResponse = responses[Math.floor(Math.random() * responses.length)];

            const responseMessage: ChatMessage = {
                id: `msg_${Date.now()}_response`,
                matchId: matchId,
                senderId: match.matchProfile.id,
                text: randomResponse,
                timestamp: new Date().toISOString(),
                type: 'text',
            };

            addChatMessage(responseMessage);
        }, 1500);
    };

    const sendStarter = (starter: typeof CONVERSATION_STARTERS[0]) => {
        sendMessage(starter.text, 'icebreaker');
    };

    if (!match) {
        return (
            <ScreenWrapper>
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>Match not found</Text>
                </View>
            </ScreenWrapper>
        );
    }

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        >
            <ScreenWrapper style={styles.screenWrapper}>
                {/* TEST VERSION DISCLAIMER */}
                <View style={styles.testBanner}>
                    <Ionicons name="information-circle" size={16} color="#FF9800" />
                    <Text style={styles.testBannerText}>
                        ⚠️ TEST VERSION - This is AI simulation, not a real person
                    </Text>
                </View>

                {/* Conversation Starters Section */}
                {showStarters && messages.length === 0 && (
                    <ScrollView
                        style={styles.startersScrollContainer}
                        contentContainerStyle={styles.startersScrollContent}
                        showsVerticalScrollIndicator={true}
                    >
                        <View style={styles.startersContainer}>
                            <MyCard style={styles.startersCard} variant="gradient" gradientColors={theme.colors.gradient.warm}>
                                <View style={styles.startersHeader}>
                                    <Text style={styles.startersTitle}>💬 Start the Conversation</Text>
                                    <Text style={styles.startersSubtitle}>Choose a conversation starter to deepen your connection</Text>
                                </View>

                                <View style={styles.categoryTabs}>
                                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryTabsContent}>
                                        {['intimate', 'romantic', 'deep', 'fun'].map((cat) => (
                                            <TouchableOpacity
                                                key={cat}
                                                style={styles.categoryTab}
                                                onPress={() => {
                                                    // Filter by category
                                                }}
                                            >
                                                <Text style={styles.categoryTabText}>
                                                    {cat === 'intimate' ? '💕 Intimate' :
                                                        cat === 'romantic' ? '🌹 Romantic' :
                                                            cat === 'deep' ? '💭 Deep' :
                                                                '🎲 Fun'}
                                                </Text>
                                            </TouchableOpacity>
                                        ))}
                                    </ScrollView>
                                </View>

                                <View style={styles.startersList}>
                                    <Text style={styles.startersSectionTitle}>💕 Intimate Starters</Text>
                                    {intimateStarters.map((starter) => (
                                        <TouchableOpacity
                                            key={starter.id}
                                            style={styles.starterButton}
                                            onPress={() => sendStarter(starter)}
                                            activeOpacity={0.8}
                                        >
                                            <Text style={styles.starterEmoji}>{starter.emoji}</Text>
                                            <Text style={styles.starterText}>{starter.text}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </MyCard>
                        </View>
                    </ScrollView>
                )}

                {/* Messages */}
                <ScrollView
                    ref={scrollViewRef}
                    style={styles.messagesContainer}
                    contentContainerStyle={styles.messagesContent}
                    showsVerticalScrollIndicator={false}
                >
                    {messages.length === 0 && !showStarters && (
                        <View style={styles.emptyState}>
                            <Text style={styles.emptyText}>Start a conversation! 💬</Text>
                        </View>
                    )}

                    {messages.map((message) => {
                        const isUser = message.senderId === 'user';
                        return (
                            <View
                                key={message.id}
                                style={[
                                    styles.messageWrapper,
                                    isUser ? styles.messageWrapperUser : styles.messageWrapperOther,
                                ]}
                            >
                                <View
                                    style={[
                                        styles.messageBubble,
                                        isUser ? styles.messageBubbleUser : styles.messageBubbleOther,
                                    ]}
                                >
                                    {message.type === 'icebreaker' && (
                                        <View style={styles.icebreakerBadge}>
                                            <Text style={styles.icebreakerText}>💡 Conversation Starter</Text>
                                        </View>
                                    )}
                                    <Text style={[
                                        styles.messageText,
                                        isUser ? styles.messageTextUser : styles.messageTextOther,
                                    ]}>
                                        {message.text}
                                    </Text>
                                    <Text style={[
                                        styles.messageTime,
                                        isUser ? styles.messageTimeUser : styles.messageTimeOther,
                                    ]}>
                                        {new Date(message.timestamp).toLocaleTimeString('en-US', {
                                            hour: '2-digit',
                                            minute: '2-digit',
                                        })}
                                    </Text>
                                </View>
                            </View>
                        );
                    })}
                </ScrollView>

                {/* Quick Actions */}
                {messages.length > 0 && (
                    <View style={styles.quickActions}>
                        <TouchableOpacity
                            style={styles.quickActionButton}
                            onPress={() => setShowStarters(!showStarters)}
                        >
                            <Ionicons name="bulb-outline" size={20} color={theme.colors.primary} />
                            <Text style={styles.quickActionText}>More Starters</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {/* Input Area */}
                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.input}
                        placeholder="Type a message..."
                        placeholderTextColor={theme.colors.textLight}
                        value={messageText}
                        onChangeText={setMessageText}
                        multiline
                        maxLength={500}
                    />
                    <TouchableOpacity
                        style={[
                            styles.sendButton,
                            !messageText.trim() && styles.sendButtonDisabled,
                        ]}
                        onPress={() => sendMessage(messageText)}
                        disabled={!messageText.trim()}
                        activeOpacity={0.8}
                    >
                        <Ionicons
                            name="send"
                            size={20}
                            color={messageText.trim() ? '#FFFFFF' : theme.colors.textLight}
                        />
                    </TouchableOpacity>
                </View>
            </ScreenWrapper>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    screenWrapper: {
        flex: 1,
        paddingBottom: 0,
    },
    testBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FFF3E0',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#FFE0B2',
        gap: 6,
    },
    testBannerText: {
        fontSize: 12,
        color: '#E65100',
        fontWeight: '600',
    },
    startersScrollContainer: {
        flex: 1,
        width: '100%',
    },
    startersScrollContent: {
        paddingBottom: theme.spacing.l,
        flexGrow: 0,
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorText: {
        ...theme.typography.body,
        color: theme.colors.error,
    },
    startersContainer: {
        paddingBottom: theme.spacing.m,
        width: '100%',
        paddingHorizontal: 0,
    },
    startersCard: {
        marginBottom: theme.spacing.m,
        borderRadius: theme.borderRadius.l,
    },
    startersHeader: {
        alignItems: 'center',
        marginBottom: theme.spacing.l,
    },
    startersTitle: {
        ...theme.typography.h2,
        color: theme.colors.text,
        fontWeight: '800',
        marginBottom: theme.spacing.xs,
    },
    startersSubtitle: {
        ...theme.typography.body,
        color: theme.colors.textLight,
        textAlign: 'center',
    },
    categoryTabs: {
        marginBottom: theme.spacing.m,
    },
    categoryTabsContent: {
        paddingHorizontal: theme.spacing.xs,
        gap: theme.spacing.s,
    },
    categoryTab: {
        paddingHorizontal: theme.spacing.l,
        paddingVertical: theme.spacing.s,
        borderRadius: theme.borderRadius.m,
        backgroundColor: theme.colors.primary + '15',
        borderWidth: 1,
        borderColor: theme.colors.primary + '30',
    },
    categoryTabText: {
        ...theme.typography.caption,
        color: theme.colors.primary,
        fontWeight: '700',
    },
    startersList: {
        gap: theme.spacing.m,
    },
    startersSectionTitle: {
        ...theme.typography.h4,
        color: theme.colors.text,
        fontWeight: '800',
        marginBottom: theme.spacing.m,
    },
    starterButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: theme.spacing.l,
        backgroundColor: theme.colors.card,
        borderRadius: theme.borderRadius.m,
        marginBottom: theme.spacing.s,
        borderLeftWidth: 4,
        borderLeftColor: theme.colors.primary,
        ...theme.shadows.soft,
    },
    starterEmoji: {
        fontSize: 24,
        marginRight: theme.spacing.m,
    },
    starterText: {
        ...theme.typography.body,
        color: theme.colors.text,
        flex: 1,
        fontWeight: '600',
    },
    messagesContainer: {
        flex: 1,
    },
    messagesContent: {
        padding: theme.spacing.m,
        paddingBottom: theme.spacing.l,
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: theme.spacing.xxl,
    },
    emptyText: {
        ...theme.typography.body,
        color: theme.colors.textLight,
    },
    messageWrapper: {
        marginBottom: theme.spacing.m,
        flexDirection: 'row',
    },
    messageWrapperUser: {
        justifyContent: 'flex-end',
    },
    messageWrapperOther: {
        justifyContent: 'flex-start',
    },
    messageBubble: {
        maxWidth: width * 0.75,
        padding: theme.spacing.m,
        borderRadius: theme.borderRadius.l,
        ...theme.shadows.soft,
    },
    messageBubbleUser: {
        backgroundColor: theme.colors.primary,
        borderBottomRightRadius: theme.borderRadius.xs,
    },
    messageBubbleOther: {
        backgroundColor: theme.colors.card,
        borderBottomLeftRadius: theme.borderRadius.xs,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    icebreakerBadge: {
        backgroundColor: theme.colors.accent + '20',
        paddingHorizontal: theme.spacing.s,
        paddingVertical: 4,
        borderRadius: theme.borderRadius.xs,
        marginBottom: theme.spacing.xs,
        alignSelf: 'flex-start',
    },
    icebreakerText: {
        ...theme.typography.captionSmall,
        color: theme.colors.accent,
        fontWeight: '700',
    },
    messageText: {
        ...theme.typography.body,
        lineHeight: 22,
    },
    messageTextUser: {
        color: '#FFFFFF',
    },
    messageTextOther: {
        color: theme.colors.text,
    },
    messageTime: {
        ...theme.typography.captionSmall,
        marginTop: theme.spacing.xs,
    },
    messageTimeUser: {
        color: '#FFFFFF',
        opacity: 0.8,
    },
    messageTimeOther: {
        color: theme.colors.textLight,
    },
    quickActions: {
        paddingHorizontal: theme.spacing.m,
        paddingVertical: theme.spacing.s,
        borderTopWidth: 1,
        borderTopColor: theme.colors.border,
    },
    quickActionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: theme.spacing.s,
        gap: theme.spacing.xs,
    },
    quickActionText: {
        ...theme.typography.caption,
        color: theme.colors.primary,
        fontWeight: '700',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        padding: theme.spacing.m,
        backgroundColor: theme.colors.card,
        borderTopWidth: 1,
        borderTopColor: theme.colors.border,
        gap: theme.spacing.s,
    },
    input: {
        flex: 1,
        ...theme.typography.body,
        color: theme.colors.text,
        backgroundColor: theme.colors.background,
        borderRadius: theme.borderRadius.m,
        paddingHorizontal: theme.spacing.m,
        paddingVertical: theme.spacing.m,
        maxHeight: 100,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    sendButton: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: theme.colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        ...theme.shadows.medium,
    },
    sendButtonDisabled: {
        backgroundColor: theme.colors.border,
    },
});

