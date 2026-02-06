import React, { useEffect, useState, useCallback } from 'react';
import { 
    View, Text, StyleSheet, ScrollView, RefreshControl, ActivityIndicator, 
    TouchableOpacity, Modal, TextInput, KeyboardAvoidingView, Platform, Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import ScreenWrapper from '../../components/ScreenWrapper';
import { InteractiveWidget } from '../../components/InteractiveWidget';
import { WidgetRenderer } from '../../components/WidgetRenderer'; 
import { NearbyPlaces } from '../../components/NearbyPlaces';
import { GeminiService } from '../../services/gemini/client'; 
import { useAppStore } from '../../state/store';
import { theme } from '../../theme';
import { InstructorFeed, InstructorWidget } from '../../types';

export default function InstructorScreen() {
    // 1. GLOBAL STATE
    const { userState, user, canAccessCoaching, demoMode } = useAppStore();
    
    // 2. DATA STATE
    const [feed, setFeed] = useState<InstructorFeed | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // 3. UI/INTENT STATE
    // Controls the "Secondary Prompt" modal
    const [modalVisible, setModalVisible] = useState(false);
    // Stores the specific user intent (e.g., "Need date ideas for rainy day")
    const [userIntent, setUserIntent] = useState(''); 

    // --- API & LOGIC ---

    /**
     * Fetches the dynamic feed from Gemini.
     * @param customIntent Optional string to override the default persona logic.
     */
    const fetchFeed = async (customIntent?: string) => {
        try {
            // Get location from profile or fallback
            // @ts-ignore
            const userLocation = user?.extendedProfile?.location || user?.location || 'Unknown City';
            
            // Mock weather context (In a real app, fetch from Weather API)
            const context = { location: userLocation, weather: 'Sunny' };
            
            // Call Gemini with the specific intent
            // NOTE: The client is now configured to return 7 widgets (5 active + 2 buffer)
            const data = await GeminiService.getInstructorFeed(userState, context, customIntent);
            
            setFeed(data);
        } catch (error) {
            console.error("Failed to load feed", error);
            Alert.alert("Error", "Could not connect to AI Coach.");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    // Initial Load: Fetch default feed based on User State
    useEffect(() => {
        setLoading(true);
        fetchFeed();
    }, [userState]);

    // Refresh Handler: Resets to default state (clears intent)
    const onRefresh = useCallback(() => {
        setRefreshing(true);
        setUserIntent(''); // Clear custom intent on refresh to go back to "Daily Mode"
        fetchFeed();
    }, [userState]);

    /**
     * Called when user submits the text in the modal.
     * Triggers a re-fetch with the new intent.
     */
    const handleGenerateWithContext = () => {
        if (!userIntent.trim()) return;
        
        setModalVisible(false); // Close modal
        setLoading(true);       // Show loading spinner
        
        // Fetch with the new specific intent
        fetchFeed(userIntent);
    };

    // --- INTERACTION HANDLERS ---

    const handleLike = (id: string, type: string) => {
        console.log(`User LIKED widget: ${id} (${type})`);
        // TODO: In the future, save this preference to the User Store to train the AI.
    };

    const handleDislike = (id: string) => {
        console.log(`User DISLIKED widget: ${id}`);
        // Remove the widget from local state.
        // ✅ KEY CHANGE: Because we fetched 7 but only render the first 5 (via slice),
        // removing one from the array automatically shifts the indices,
        // causing the 6th item (buffer) to slide into the 5th position.
        setFeed(prev => {
            if (!prev) return null;
            return {
                ...prev,
                widgets: prev.widgets.filter(w => w.id !== id)
            };
        });
    };

    // --- THEME HELPER ---
    const getThemeColor = () => {
        switch (userState) {
            case 'HEALING': return '#FF9A9E';
            case 'DATING': return '#FF6B6B';
            case 'RELATIONSHIP': return '#a18cd1';
            default: return theme.colors.primary;
        }
    };
    const currentColor = getThemeColor();

    // Show locked state if feature not accessible
    if (!canAccessCoaching() && !demoMode) {
        return (
            <ScreenWrapper>
                <View style={styles.lockedContainer}>
                    <View style={styles.lockedIconContainer}>
                        <Ionicons name="lock-closed" size={64} color={theme.colors.textLight} />
                    </View>
                    <Text style={styles.lockedTitle}>AI Coach Locked</Text>
                    <Text style={styles.lockedSubtitle}>
                        Complete your healing journey and make {3} matches to unlock personalized coaching recommendations.
                    </Text>
                    <View style={styles.lockedSteps}>
                        <View style={styles.lockedStep}>
                            <View style={[styles.stepCircle, { backgroundColor: '#4ECDC420' }]}>
                                <Ionicons name="leaf" size={20} color="#4ECDC4" />
                            </View>
                            <Text style={styles.stepText}>Complete healing phase</Text>
                            <Ionicons name="checkmark-circle" size={20} color="#4ECDC4" />
                        </View>
                        <View style={styles.lockedStep}>
                            <View style={[styles.stepCircle, { backgroundColor: '#FF6B6B20' }]}>
                                <Ionicons name="heart" size={20} color="#FF6B6B" />
                            </View>
                            <Text style={styles.stepText}>Make 3 matches</Text>
                            <Ionicons name="ellipse-outline" size={20} color={theme.colors.textLight} />
                        </View>
                    </View>
                </View>
            </ScreenWrapper>
        );
    }

    return (
        <ScreenWrapper>
            {/* --- HEADER --- */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.greeting}>Hi, {user?.name || 'Friend'}</Text>
                    
                    {/* Dynamic Subtitle Row */}
                    <View style={styles.subtitleRow}>
                        <View style={[styles.stateBadge, { backgroundColor: currentColor + '20' }]}>
                            <Text style={[styles.stateText, { color: currentColor }]}>
                                {userState}
                            </Text>
                        </View>
                        
                        <Text style={styles.subtitleText}>daily plan</Text>
                    </View>
                </View>

                {/* --- SECONDARY PROMPT BUTTON --- */}
                <TouchableOpacity 
                    onPress={() => setModalVisible(true)} 
                    style={[styles.actionBtn, { borderColor: theme.colors.border }]}
                >
                    <Ionicons name="bulb-outline" size={24} color={theme.colors.text} />
                </TouchableOpacity>
            </View>

            {/* --- FEED SCROLLVIEW --- */}
            <ScrollView 
                contentContainerStyle={styles.scrollContent}
                refreshControl={
                    <RefreshControl 
                        refreshing={refreshing} 
                        onRefresh={onRefresh} 
                        tintColor={currentColor} 
                    />
                }
            >
                {/* 1. Loading State */}
                {loading && !refreshing ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color={currentColor} />
                        <Text style={styles.loadingText}>
                            {userIntent ? "Customizing your plan..." : "Curating suggestions..."}
                        </Text>
                    </View>
                ) : (
                    <>
                        {/* 2. AI Generated Title */}
                        <Text style={styles.screenTitle}>
                            {feed?.screenTitle || "Your Daily Guide"}
                        </Text>
                        
                        {/* 🗺️ NEARBY PLACES SECTION */}
                        <NearbyPlaces 
                            context={userState === 'HEALING' ? 'healing' : userState === 'RELATIONSHIP' ? 'relationship' : 'dating'}
                            title={userState === 'HEALING' ? '🧘 Peaceful Spots Nearby' : userState === 'RELATIONSHIP' ? '💑 Date Night Ideas' : '📍 Date Spots Near You'}
                        />

                        {/* 3. Render Widgets (Limit to first 5) */}
                        {feed?.widgets?.slice(0, 5).map((widget) => {
                            
                            // Check if it's a carousel type
                            const isCarousel = [
                                'place_card', 'music_playlist', 'movie_list', 'book_list', 
                                'outfit_guide', 'gift_guide', 'date_idea'
                            ].includes(widget.type);

                            if (isCarousel) {
                                return (
                                     <WidgetRenderer key={widget.id} widget={widget} />
                                );
                            } else {
                                return (
                                    <InteractiveWidget 
                                        key={widget.id} 
                                        widget={widget} 
                                        onLike={handleLike}
                                        onDislike={handleDislike}
                                    />
                                );
                            }
                        })}

                        {/* 4. Empty State Handler */}
                        {(!feed?.widgets || feed.widgets.length === 0) && (
                            <View style={styles.emptyContainer}>
                                <Text style={styles.emptyText}>No suggestions found.</Text>
                                <TouchableOpacity onPress={onRefresh} style={styles.retryBtn}>
                                    <Text style={styles.retryText}>Refresh</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                        
                        <View style={{ height: 60 }} />
                    </>
                )}
            </ScrollView>

            {/* --- SECONDARY PROMPT MODAL --- */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <KeyboardAvoidingView 
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={styles.modalOverlay}
                >
                    <View style={styles.modalContent}>
                        {/* Modal Header */}
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Guide your AI Coach</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <Ionicons name="close" size={24} color={theme.colors.textLight} />
                            </TouchableOpacity>
                        </View>
                        
                        <Text style={styles.modalSubtitle}>
                            Tell us what you need right now. The AI will completely regenerate the feed for this specific goal.
                        </Text>

                        {/* Input Area */}
                        <TextInput
                            style={styles.input}
                            placeholder="e.g., 'I'm feeling lonely', 'Friday date ideas', 'Anniversary gift'"
                            placeholderTextColor="#999"
                            value={userIntent}
                            onChangeText={setUserIntent}
                            autoFocus
                            multiline
                        />

                        {/* Submit Button */}
                        <TouchableOpacity 
                            style={[styles.generateBtn, { backgroundColor: currentColor }]} 
                            onPress={handleGenerateWithContext}
                        >
                            <Ionicons name="sparkles" size={20} color="#FFF" style={{ marginRight: 8 }} />
                            <Text style={styles.generateBtnText}>Inspire Me</Text>
                        </TouchableOpacity>
                    </View>
                </KeyboardAvoidingView>
            </Modal>
        </ScreenWrapper>
    );
}

const styles = StyleSheet.create({
    // Header Styles
    header: { 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: 24, 
        marginTop: 10, 
        paddingHorizontal: 4 
    },
    greeting: { 
        fontSize: 28, 
        fontWeight: '800', 
        color: theme.colors.text, 
        marginBottom: 4 
    },
    subtitleRow: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        gap: 8 
    },
    subtitleText: { 
        fontSize: 16, 
        color: theme.colors.textLight, 
        fontWeight: '500' 
    },
    stateBadge: { 
        paddingHorizontal: 8, 
        paddingVertical: 4, 
        borderRadius: 8 
    },
    stateText: { 
        fontWeight: '800', 
        fontSize: 12, 
        letterSpacing: 0.5 
    },
    contextTag: { 
        fontSize: 14, 
        color: theme.colors.text, 
        fontStyle: 'italic', 
        maxWidth: 200 
    },
    actionBtn: { 
        width: 48, 
        height: 48, 
        borderRadius: 24, 
        backgroundColor: theme.colors.card, 
        justifyContent: 'center', 
        alignItems: 'center', 
        ...theme.shadows.soft, 
        borderWidth: 1 
    },

    // Feed Styles
    scrollContent: { 
        paddingBottom: 40 
    },
    loadingContainer: { 
        marginTop: 60, 
        alignItems: 'center' 
    },
    loadingText: { 
        marginTop: 16, 
        color: theme.colors.textLight, 
        fontSize: 14, 
        fontStyle: 'italic' 
    },
    screenTitle: { 
        fontSize: 22, 
        fontWeight: '700', 
        color: theme.colors.text, 
        marginBottom: 20, 
        lineHeight: 30, 
        opacity: 0.9 
    },
    emptyContainer: { 
        alignItems: 'center', 
        marginTop: 40 
    },
    emptyText: { 
        color: theme.colors.textLight, 
        marginBottom: 16 
    },
    retryBtn: { 
        padding: 12, 
        backgroundColor: theme.colors.card, 
        borderRadius: 8 
    },
    retryText: { 
        fontWeight: 'bold', 
        color: theme.colors.text 
    },
    
    // Modal Styles
    modalOverlay: { 
        flex: 1, 
        backgroundColor: 'rgba(0,0,0,0.5)', 
        justifyContent: 'flex-end' 
    },
    modalContent: { 
        backgroundColor: '#FFF', 
        borderTopLeftRadius: 24, 
        borderTopRightRadius: 24, 
        padding: 24, 
        paddingBottom: 40,
        ...theme.shadows.large 
    },
    modalHeader: { 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: 16 
    },
    modalTitle: { 
        fontSize: 20, 
        fontWeight: 'bold',
        color: theme.colors.text
    },
    modalSubtitle: { 
        fontSize: 14, 
        color: theme.colors.textLight, 
        marginBottom: 20, 
        lineHeight: 20 
    },
    input: { 
        backgroundColor: '#F0F2F5', 
        padding: 16, 
        borderRadius: 16, 
        fontSize: 16, 
        color: theme.colors.text,
        marginBottom: 24, 
        height: 80,
        textAlignVertical: 'top'
    },
    generateBtn: { 
        flexDirection: 'row', 
        padding: 16, 
        borderRadius: 16, 
        justifyContent: 'center', 
        alignItems: 'center', 
        marginBottom: 10,
        ...theme.shadows.medium
    },
    generateBtnText: { 
        color: '#FFF', 
        fontSize: 18, 
        fontWeight: 'bold' 
    },

    // Locked State Styles
    lockedContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
    },
    lockedIconContainer: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: theme.colors.border,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
    },
    lockedTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: theme.colors.text,
        marginBottom: 12,
        textAlign: 'center',
    },
    lockedSubtitle: {
        fontSize: 16,
        color: theme.colors.textLight,
        textAlign: 'center',
        lineHeight: 24,
        marginBottom: 32,
    },
    lockedSteps: {
        width: '100%',
        gap: 12,
    },
    lockedStep: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.card,
        padding: 16,
        borderRadius: 12,
        gap: 12,
    },
    stepCircle: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    stepText: {
        flex: 1,
        fontSize: 15,
        color: theme.colors.text,
        fontWeight: '500',
    },
});