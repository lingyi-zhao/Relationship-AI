import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Image,
    Dimensions,
    TouchableOpacity,
    Alert,
    FlatList,
    Animated,
    ScrollView,
    ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import ScreenWrapper from '../../components/ScreenWrapper';
import MyCard from '../../components/MyCard';
import { NearbyPeople } from '../../components/NearbyPeople';
import { MOCK_MATCHES, calculateCompatibility } from '../../utils/mockData';
import { useAppStore } from '../../state/store';
import { GeminiService } from '../../services/gemini/client';
import { theme } from '../../theme';

import { RootStackParamList, MatchProfile } from '../../types';

const { width } = Dimensions.get('window');
const REQUIRED_DAYS = 30;

// 🔧 FEATURE FLAG: Set to true when you have a real user database
// When true: Uses Gemini AI to generate personalized profiles and calculate compatibility
// When false: Uses mock data with images (current state for demo)
const USE_AI_MATCHING = false;

type DatingTab = 'discover' | 'matches';

export default function DatingScreen() {
    const navigation = useNavigation<NavigationProp<RootStackParamList>>();

    // Global Store
    const {
        saveMatch,
        matches,
        user,
        checkInForDating,
        hasCheckedInToday,
        getDatingCheckInCount,
        canAccessDating,
        skipDatingCheckIn,
        resetDatingCheckIn,
        demoMode,
        completeHealingPhase,
    } = useAppStore();

    // Local State
    const [activeTab, setActiveTab] = useState<DatingTab>('discover');
    const [currentIndex, setCurrentIndex] = useState(0);
    const [checkedInToday, setCheckedInToday] = useState(false);
    const [checkInCount, setCheckInCount] = useState(0);
    const [isUnlocked, setIsUnlocked] = useState(false);
    
    // AI-Generated Profiles State (for future use)
    const [aiProfiles, setAiProfiles] = useState<MatchProfile[]>([]);
    const [loadingProfiles, setLoadingProfiles] = useState(false);
    const [profilesError, setProfilesError] = useState<string | null>(null);

    // Animation for progress
    const progressAnim = useState(new Animated.Value(0))[0];

    // Refresh state on mount and after actions
    const refreshState = () => {
        setCheckedInToday(hasCheckedInToday());
        setCheckInCount(getDatingCheckInCount());
        setIsUnlocked(canAccessDating());
    };

    useEffect(() => {
        refreshState();
    }, []);

    // 🚀 FUTURE: Generate AI profiles when USE_AI_MATCHING is enabled
    useEffect(() => {
        if (USE_AI_MATCHING && isUnlocked && user) {
            generateAIProfiles();
        }
    }, [isUnlocked, user]);

    // 🚀 FUTURE: AI Profile Generation (ready for when you have a database)
    const generateAIProfiles = async () => {
        if (!GeminiService.isConfigured()) {
            Alert.alert('API Key Required', 'Please add your Gemini API key to generate profiles.');
            setLoadingProfiles(false);
            return;
        }

        setLoadingProfiles(true);
        setProfilesError(null);

        try {
            const location = (user?.extendedProfile as any)?.location || user?.location || 'San Francisco, CA';
            
            const response = await GeminiService.generateDatingProfiles({
                age: user?.age || 25,
                gender: (user?.extendedProfile as any)?.gender,
                interests: user?.interests || [],
                location: location,
                datingGoal: (user?.extendedProfile as any)?.datingGoal
            }, 10);

            const parsed = JSON.parse(response);
            const profiles: MatchProfile[] = await Promise.all(
                parsed.profiles.map(async (p: any) => {
                    const profile: MatchProfile = {
                        id: p.id,
                        name: p.name,
                        age: p.age,
                        bio: p.bio,
                        interests: p.interests,
                        compatibilityScore: 85,
                        gender: p.gender,
                        location: p.location,
                        datingGoal: p.datingGoal,
                        imageUrl: getProfileImageUrl(p.gender),
                    };

                    // Calculate AI compatibility (with timeout protection)
                    try {
                        const score = await Promise.race([
                            GeminiService.calculateCompatibility(
                                {
                                    interests: user?.interests || [],
                                    age: user?.age || 25,
                                    datingGoal: (user?.extendedProfile as any)?.datingGoal
                                },
                                profile
                            ),
                            new Promise<number>((_, reject) => 
                                setTimeout(() => reject(new Error('Timeout')), 5000)
                            )
                        ]);
                        profile.compatibilityScore = score;
                    } catch (err) {
                        // Fallback to simple calculation
                        profile.compatibilityScore = calculateCompatibility(
                            user?.interests || [],
                            profile.interests
                        );
                    }

                    return profile;
                })
            );

            profiles.sort((a, b) => b.compatibilityScore - a.compatibilityScore);
            setAiProfiles(profiles);
        } catch (error: any) {
            console.error('Profile generation error:', error);
            setProfilesError('Failed to generate profiles. Using mock data.');
        } finally {
            setLoadingProfiles(false);
        }
    };

    // Helper to get profile image based on gender
    const getProfileImageUrl = (gender?: string): string => {
        const maleImages = [
            'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face',
            'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=face',
            'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face',
            'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop&crop=face',
            'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=400&h=400&fit=crop&crop=face',
        ];
        const femaleImages = [
            'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop&crop=face',
            'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop&crop=face',
            'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&h=400&fit=crop&crop=face',
            'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&h=400&fit=crop&crop=face',
            'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=400&h=400&fit=crop&crop=face',
        ];
        const nonbinaryImages = [
            'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&h=400&fit=crop&crop=face',
            'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=400&h=400&fit=crop&crop=face',
        ];

        let images = maleImages;
        if (gender?.toLowerCase().includes('female')) images = femaleImages;
        else if (gender?.toLowerCase().includes('non')) images = nonbinaryImages;

        return images[Math.floor(Math.random() * images.length)];
    };

    // Animate progress bar
    useEffect(() => {
        const progress = checkInCount / REQUIRED_DAYS;
        Animated.spring(progressAnim, {
            toValue: progress,
            useNativeDriver: false,
        }).start();
    }, [checkInCount]);

    // 🚀 FUTURE: Use AI profiles when enabled, fallback to mock data
    const filteredProfiles = USE_AI_MATCHING ? aiProfiles : MOCK_MATCHES;
    const currentProfile = filteredProfiles[currentIndex];

    // --- CHECK-IN LOGIC ---
    const handleCheckIn = () => {
        const success = checkInForDating();
        if (success) {
            Alert.alert(
                "Check-in Complete! 🎉",
                `Day ${getDatingCheckInCount()} / ${REQUIRED_DAYS}\n\nKeep going! You're building healthy relationship habits.`
            );
            refreshState();
        } else {
            Alert.alert("Already Checked In", "You've already checked in today. Come back tomorrow!");
        }
    };

    // --- TEST MODE: Skip 30 days ---
    const handleSkip = () => {
        skipDatingCheckIn();
        refreshState();
        Alert.alert("Test Mode", "30-day requirement skipped! You can now access dating features.");
    };

    // --- SWIPE LOGIC ---
    const handleSwipe = (direction: 'left' | 'right') => {
        if (!currentProfile) return;

        if (direction === 'right') {
            const match = saveMatch(currentProfile);
            if (match) {
                Alert.alert("It's a Match! 🎉", `You and ${currentProfile.name} connected!`);
            }
        }

        // Move to next card
        if (currentIndex < filteredProfiles.length - 1) {
            setCurrentIndex(prev => prev + 1);
        } else {
            Alert.alert("All caught up!", "Check back later for more profiles.");
        }
    };

    // --- RENDER: Header Tabs ---
    const renderHeader = () => (
        <View style={styles.headerContainer}>
            {/* Back Button - Return to Check-in */}
            <TouchableOpacity
                style={styles.backButton}
                onPress={() => {
                    Alert.alert(
                        "Exit Dating Mode",
                        "Return to check-in screen?",
                        [
                            { text: "Cancel", style: "cancel" },
                            {
                                text: "Exit",
                                onPress: () => {
                                    resetDatingCheckIn();
                                    refreshState();
                                }
                            }
                        ]
                    );
                }}
            >
                <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
            </TouchableOpacity>

            <TouchableOpacity
                style={[styles.tabButton, activeTab === 'discover' && styles.activeTab]}
                onPress={() => setActiveTab('discover')}
            >
                <Text style={[styles.tabText, activeTab === 'discover' && styles.activeTabText]}>
                    Discover
                </Text>
            </TouchableOpacity>

            <View style={styles.verticalDivider} />

            <TouchableOpacity
                style={[styles.tabButton, activeTab === 'matches' && styles.activeTab]}
                onPress={() => setActiveTab('matches')}
            >
                <Text style={[styles.tabText, activeTab === 'matches' && styles.activeTabText]}>
                    Matches
                </Text>
                {/* Unread badge logic */}
                {matches.some(m => m.unreadCount > 0) && (
                    <View style={styles.badge} />
                )}
            </TouchableOpacity>
        </View>
    );

    // --- RENDER: Check-in Screen (Before Unlock) ---
    const renderCheckIn = () => {
        const progressWidth = progressAnim.interpolate({
            inputRange: [0, 1],
            outputRange: ['0%', '100%'],
        });

        return (
            <View style={styles.checkInContainer}>
                {/* Header Icon */}
                <View style={styles.checkInIconContainer}>
                    <Ionicons name="heart-circle" size={80} color={theme.colors.primary} />
                </View>

                {/* Title */}
                <Text style={styles.checkInTitle}>Build Your Dating Readiness</Text>
                <Text style={styles.checkInSubtitle}>
                    Check in daily for {REQUIRED_DAYS} days to unlock the dating feature.{'\n'}
                    This helps you build healthy relationship habits.
                </Text>

                {/* Progress */}
                <View style={styles.progressContainer}>
                    <View style={styles.progressBar}>
                        <Animated.View
                            style={[styles.progressFill, { width: progressWidth }]}
                        />
                    </View>
                    <Text style={styles.progressText}>
                        {checkInCount} / {REQUIRED_DAYS} days
                    </Text>
                </View>

                {/* Check-in Button */}
                <TouchableOpacity
                    style={[
                        styles.checkInButton,
                        checkedInToday && styles.checkInButtonDisabled
                    ]}
                    onPress={handleCheckIn}
                    disabled={checkedInToday}
                >
                    <Ionicons
                        name={checkedInToday ? "checkmark-circle" : "add-circle"}
                        size={24}
                        color="#FFF"
                    />
                    <Text style={styles.checkInButtonText}>
                        {checkedInToday ? "Checked In Today ✓" : "Check In Today"}
                    </Text>
                </TouchableOpacity>

                {/* Streak Info */}
                {checkInCount > 0 && (
                    <View style={styles.streakContainer}>
                        <Ionicons name="flame" size={20} color="#FF6B35" />
                        <Text style={styles.streakText}>
                            {checkInCount} day{checkInCount > 1 ? 's' : ''} completed!
                        </Text>
                    </View>
                )}

                {/* TEST MODE: Skip Button */}
                <TouchableOpacity
                    style={styles.skipButton}
                    onPress={handleSkip}
                >
                    <Text style={styles.skipButtonText}>Skip for Testing (Dev Only)</Text>
                </TouchableOpacity>
            </View>
        );
    };

    // Generate nearby people from mock matches
    const nearbyPeople = filteredProfiles.slice(0, 6).map((p, idx) => ({
        id: p.id,
        name: p.name,
        age: p.age,
        distance: `${(0.3 + idx * 0.4).toFixed(1)} mi`,
        imageUrl: p.imageUrl || '',
        compatibility: p.compatibilityScore,
        isOnline: idx % 2 === 0,
        bio: p.bio,
    }));

    // --- RENDER: Discover (Swipe Deck) ---
    const renderDiscover = () => {
        // 🚀 Show loading only when AI matching is enabled
        if (USE_AI_MATCHING && loadingProfiles) {
            return (
                <View style={styles.centerContent}>
                    <ActivityIndicator size="large" color={theme.colors.primary} />
                    <Text style={styles.loadingText}>Finding compatible matches...</Text>
                    <Text style={styles.loadingSubtext}>AI is analyzing profiles near you</Text>
                </View>
            );
        }

        // 🚀 Show error only when AI matching is enabled
        if (USE_AI_MATCHING && profilesError) {
            return (
                <View style={styles.centerContent}>
                    <Ionicons name="alert-circle" size={64} color={theme.colors.error} />
                    <Text style={styles.errorText}>{profilesError}</Text>
                    <TouchableOpacity onPress={generateAIProfiles} style={styles.retryBtn}>
                        <Text style={styles.retryText}>Retry</Text>
                    </TouchableOpacity>
                </View>
            );
        }

        if (!currentProfile) {
            return (
                <View style={styles.centerContent}>
                    <Ionicons name="search" size={64} color={theme.colors.textLight} />
                    <Text style={styles.emptyText}>No more profiles nearby.</Text>
                    {USE_AI_MATCHING && (
                        <TouchableOpacity onPress={generateAIProfiles} style={styles.resetBtn}>
                            <Text style={styles.resetText}>Generate New Profiles</Text>
                        </TouchableOpacity>
                    )}
                </View>
            );
        }

        return (
            <ScrollView style={styles.discoverScroll} showsVerticalScrollIndicator={false}>
                {/* Nearby People Carousel */}
                <NearbyPeople 
                    people={nearbyPeople} 
                    onPersonPress={(person) => {
                        const idx = filteredProfiles.findIndex(p => p.id === person.id);
                        if (idx !== -1) setCurrentIndex(idx);
                    }}
                />

                {/* Main Profile Card */}
                <View style={styles.swipeContainer}>
                    <MyCard style={styles.profileCard}>
                        {/* Image Area */}
                        <View style={styles.imageArea}>
                            {currentProfile.imageUrl ? (
                                <Image source={{ uri: currentProfile.imageUrl }} style={styles.image} />
                            ) : (
                                <View style={[styles.image, styles.placeholderImage]}>
                                    <Text style={styles.avatarLetter}>{currentProfile.name[0]}</Text>
                                </View>
                            )}
                            <View style={styles.matchScoreBadge}>
                                <Text style={styles.matchScoreText}>{currentProfile.compatibilityScore}% Match</Text>
                            </View>
                            {/* Location Badge */}
                            <View style={styles.locationBadge}>
                                <Ionicons name="location" size={12} color="#FFF" />
                                <Text style={styles.locationText}>{currentProfile.location}</Text>
                            </View>
                        </View>

                        {/* Info Area */}
                        <View style={styles.infoArea}>
                            <View style={styles.nameRow}>
                                <Text style={styles.name}>{currentProfile.name}, {currentProfile.age}</Text>
                                {currentProfile.datingGoal && (
                                    <View style={styles.goalBadge}>
                                        <Text style={styles.goalText}>{currentProfile.datingGoal}</Text>
                                    </View>
                                )}
                            </View>
                            <Text style={styles.bio} numberOfLines={3}>{currentProfile.bio}</Text>

                            <View style={styles.interestsRow}>
                                {currentProfile.interests.map((tag, i) => (
                                    <View key={i} style={styles.tag}>
                                        <Text style={styles.tagText}>#{tag}</Text>
                                    </View>
                                ))}
                            </View>
                        </View>
                    </MyCard>

                    {/* Action Buttons */}
                    <View style={styles.actionButtonsContainer}>
                        <TouchableOpacity style={[styles.actionBtn, styles.passBtn]} onPress={() => handleSwipe('left')}>
                            <Ionicons name="close" size={32} color="#FF6B6B" />
                        </TouchableOpacity>

                        <TouchableOpacity style={[styles.actionBtn, styles.superBtn]} onPress={() => Alert.alert("Super Like! ⭐", `You super liked ${currentProfile.name}!`)}>
                            <Ionicons name="star" size={24} color="#4D96FF" />
                        </TouchableOpacity>

                        <TouchableOpacity style={[styles.actionBtn, styles.likeBtn]} onPress={() => handleSwipe('right')}>
                            <Ionicons name="heart" size={32} color="#4ECDC4" />
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={{ height: 40 }} />
            </ScrollView>
        );
    };

    // --- RENDER: Matches List (Chat Entry) ---
    const renderMatches = () => {
        if (matches.length === 0) {
            return (
                <View style={styles.centerContent}>
                    <Ionicons name="heart-dislike-outline" size={64} color={theme.colors.textLight} />
                    <Text style={styles.emptyText}>No matches yet.</Text>
                    <Text style={styles.subEmptyText}>Start swiping to find your person!</Text>
                    <TouchableOpacity
                        style={styles.goSwipeBtn}
                        onPress={() => setActiveTab('discover')}
                    >
                        <Text style={styles.goSwipeText}>Start Swiping</Text>
                    </TouchableOpacity>
                </View>
            );
        }

        return (
            <FlatList
                data={matches}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContent}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={styles.matchRow}
                        onPress={() => navigation.navigate('Chat', { matchId: item.id })}
                    >
                        {/* Avatar */}
                        <View style={styles.matchAvatar}>
                            <Text style={styles.matchAvatarText}>{item.matchProfile.name[0]}</Text>
                        </View>

                        {/* Content */}
                        <View style={styles.matchContent}>
                            <View style={styles.matchHeader}>
                                <Text style={styles.matchName}>{item.matchProfile.name}</Text>
                                <Text style={styles.matchTime}>
                                    {new Date(item.lastMessageAt || item.matchedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </Text>
                            </View>
                            <Text style={styles.lastMessage} numberOfLines={1}>
                                {item.lastMessageAt ? "Click to continue chatting..." : "New match! Say hello 👋"}
                            </Text>
                        </View>

                        {/* Unread Indicator */}
                        {item.unreadCount > 0 && (
                            <View style={styles.unreadBadge}>
                                <Text style={styles.unreadText}>{item.unreadCount}</Text>
                            </View>
                        )}

                        <Ionicons name="chevron-forward" size={20} color={theme.colors.textLight} />
                    </TouchableOpacity>
                )}
            />
        );
    };

    // --- RENDER: Feature Locked (Healing not complete) ---
    const renderLocked = () => (
        <View style={styles.lockedContainer}>
            <View style={styles.lockedIconContainer}>
                <Ionicons name="heart-dislike" size={64} color={theme.colors.textLight} />
            </View>
            <Text style={styles.lockedTitle}>Dating Feature Locked</Text>
            <Text style={styles.lockedSubtitle}>
                Complete your healing journey first.{'\n'}
                Take time to process your emotions before jumping into dating.
            </Text>
            <View style={styles.lockedTip}>
                <Ionicons name="bulb" size={20} color={theme.colors.accent} />
                <Text style={styles.lockedTipText}>
                    Visit the Healing tab to start journaling, meditation, and emotional processing.
                </Text>
            </View>
            <TouchableOpacity 
                style={styles.unlockTestBtn}
                onPress={completeHealingPhase}
            >
                <Text style={styles.unlockTestBtnText}>Skip for Demo (Dev Only)</Text>
            </TouchableOpacity>
        </View>
    );

    // --- MAIN RENDER ---
    // Show locked if healing not complete (and not demo mode)
    if (!canAccessDating() && !demoMode) {
        return (
            <ScreenWrapper style={{ paddingHorizontal: 0 }}>
                {renderLocked()}
            </ScreenWrapper>
        );
    }

    // Show check-in screen if unlocked but not fully ready
    if (!isUnlocked && !demoMode) {
        return (
            <ScreenWrapper style={{ paddingHorizontal: 0 }}>
                {renderCheckIn()}
            </ScreenWrapper>
        );
    }

    // Show dating features if unlocked
    return (
        <ScreenWrapper style={{ paddingHorizontal: 0 }}>
            {renderHeader()}
            <View style={styles.contentContainer}>
                {activeTab === 'discover' ? renderDiscover() : renderMatches()}
            </View>
        </ScreenWrapper>
    );
}

const styles = StyleSheet.create({
    // --- Check-in Screen Styles ---
    backButton: {
        padding: 10,
        marginRight: 5,
    },
    checkInContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 32,
        backgroundColor: theme.colors.background,
    },
    checkInIconContainer: {
        marginBottom: 24,
    },
    checkInTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: theme.colors.text,
        textAlign: 'center',
        marginBottom: 12,
    },
    checkInSubtitle: {
        fontSize: 15,
        color: theme.colors.textLight,
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 32,
    },
    progressContainer: {
        width: '100%',
        marginBottom: 32,
    },
    progressBar: {
        height: 12,
        backgroundColor: '#E0E0E0',
        borderRadius: 6,
        overflow: 'hidden',
        marginBottom: 8,
    },
    progressFill: {
        height: '100%',
        backgroundColor: theme.colors.primary,
        borderRadius: 6,
    },
    progressText: {
        textAlign: 'center',
        fontSize: 16,
        fontWeight: '600',
        color: theme.colors.text,
    },
    checkInButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: theme.colors.primary,
        paddingVertical: 16,
        paddingHorizontal: 32,
        borderRadius: 30,
        gap: 8,
        ...theme.shadows.medium,
    },
    checkInButtonDisabled: {
        backgroundColor: '#4ECDC4',
    },
    checkInButtonText: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: 'bold',
    },
    streakContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 24,
        gap: 6,
    },
    streakText: {
        fontSize: 16,
        color: '#FF6B35',
        fontWeight: '600',
    },
    skipButton: {
        marginTop: 40,
        padding: 12,
    },
    skipButtonText: {
        color: theme.colors.textLighter || '#999',
        fontSize: 12,
        textDecorationLine: 'underline',
    },

    // --- Header Tabs ---
    headerContainer: {
        flexDirection: 'row',
        height: 50,
        backgroundColor: theme.colors.background,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
        alignItems: 'center',
        justifyContent: 'center',
    },
    tabButton: {
        flex: 1,
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
    },
    activeTab: {
        borderBottomWidth: 2,
        borderBottomColor: theme.colors.primary,
    },
    tabText: {
        fontSize: 16,
        fontWeight: '600',
        color: theme.colors.textLight,
    },
    activeTabText: {
        color: theme.colors.primary,
        fontWeight: 'bold',
    },
    verticalDivider: {
        width: 1,
        height: '40%',
        backgroundColor: theme.colors.border,
    },
    badge: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: theme.colors.error || 'red', // Fallback if error color missing
        marginLeft: 6,
        marginBottom: 8,
    },

    // --- Layout ---
    contentContainer: {
        flex: 1,
        backgroundColor: '#F8F9FA',
    },
    centerContent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
    },
    emptyText: {
        marginTop: 20,
        fontSize: 18,
        fontWeight: 'bold',
        color: theme.colors.text,
    },
    subEmptyText: {
        fontSize: 14,
        color: theme.colors.textLight,
        marginTop: 8,
        textAlign: 'center',
    },
    resetBtn: {
        marginTop: 20,
        padding: 12,
        backgroundColor: theme.colors.card,
        borderRadius: 8,
    },
    resetText: {
        color: theme.colors.primary,
        fontWeight: 'bold',
    },
    goSwipeBtn: {
        marginTop: 24,
        backgroundColor: theme.colors.primary,
        paddingVertical: 12,
        paddingHorizontal: 32,
        borderRadius: 24,
    },
    goSwipeText: {
        color: '#FFF',
        fontWeight: 'bold',
    },

    // --- Discover / Swipe Styles ---
    discoverScroll: {
        flex: 1,
    },
    swipeContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 16,
    },
    profileCard: {
        width: width - 32,
        padding: 0,
        borderRadius: 20,
        overflow: 'hidden',
        ...theme.shadows.medium,
    },
    imageArea: {
        height: 320,
        backgroundColor: '#DDD',
    },
    image: {
        width: '100%',
        height: '100%',
    },
    placeholderImage: {
        backgroundColor: theme.colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarLetter: {
        fontSize: 80,
        color: 'rgba(255,255,255,0.5)',
        fontWeight: 'bold',
    },
    matchScoreBadge: {
        position: 'absolute',
        top: 16,
        right: 16,
        backgroundColor: 'rgba(0,0,0,0.7)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
    },
    matchScoreText: {
        color: '#4ECDC4',
        fontWeight: 'bold',
        fontSize: 13,
    },
    locationBadge: {
        position: 'absolute',
        top: 16,
        left: 16,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.7)',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 10,
        gap: 4,
    },
    locationText: {
        color: '#FFF',
        fontSize: 12,
        fontWeight: '600',
    },
    infoArea: {
        padding: 20,
        backgroundColor: '#FFF',
    },
    nameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    name: {
        fontSize: 24,
        fontWeight: '800',
        color: theme.colors.text,
    },
    goalBadge: {
        backgroundColor: theme.colors.primary + '15',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
    },
    goalText: {
        fontSize: 11,
        color: theme.colors.primary,
        fontWeight: '600',
    },
    bio: {
        fontSize: 15,
        color: theme.colors.textLight,
        lineHeight: 22,
        marginBottom: 16,
    },
    interestsRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    tag: {
        backgroundColor: '#F0F2F5',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 8,
    },
    tagText: {
        fontSize: 12,
        color: theme.colors.textLight,
        fontWeight: '600',
    },
    actionButtonsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        width: '80%',
        marginTop: 20,
        alignItems: 'center',
    },
    actionBtn: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#FFF',
        justifyContent: 'center',
        alignItems: 'center',
        ...theme.shadows.medium,
    },
    passBtn: {
        borderWidth: 1,
        borderColor: '#FF6B6B',
    },
    likeBtn: {
        borderWidth: 1,
        borderColor: '#4ECDC4',
    },
    superBtn: {
        width: 44,
        height: 44,
        marginTop: -10, // Visual offset
        backgroundColor: '#F0F9FF',
    },

    // --- Matches List Styles ---
    listContent: {
        padding: 16,
    },
    matchRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF',
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        // ✅ FIX: Changed 'small' to 'soft' (or you can use 'medium')
        ...theme.shadows.soft,
    },
    matchAvatar: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: theme.colors.secondary || '#999',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    matchAvatarText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#FFF',
    },
    matchContent: {
        flex: 1,
        marginRight: 10,
    },
    matchHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    matchName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: theme.colors.text,
    },
    matchTime: {
        fontSize: 12,
        color: theme.colors.textLighter,
    },
    lastMessage: {
        fontSize: 14,
        color: theme.colors.textLight,
    },
    unreadBadge: {
        backgroundColor: theme.colors.primary,
        minWidth: 20,
        height: 20,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 6,
        marginRight: 8,
    },
    unreadText: {
        color: '#FFF',
        fontSize: 10,
        fontWeight: 'bold',
    },

    // Locked State Styles
    lockedContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
        backgroundColor: theme.colors.background,
    },
    lockedIconContainer: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: '#FFE5E5',
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
        marginBottom: 24,
    },
    lockedTip: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        backgroundColor: theme.colors.accent + '15',
        padding: 16,
        borderRadius: 12,
        gap: 12,
        marginBottom: 32,
    },
    lockedTipText: {
        flex: 1,
        fontSize: 14,
        color: theme.colors.text,
        lineHeight: 20,
    },
    unlockTestBtn: {
        padding: 12,
    },
    unlockTestBtnText: {
        fontSize: 12,
        color: theme.colors.textLighter,
        textDecorationLine: 'underline',
    },
    
    // Loading & Error States
    loadingText: {
        marginTop: 16,
        fontSize: 18,
        fontWeight: '600',
        color: theme.colors.text,
    },
    loadingSubtext: {
        marginTop: 8,
        fontSize: 14,
        color: theme.colors.textLight,
    },
    errorText: {
        marginTop: 20,
        fontSize: 16,
        color: theme.colors.error,
        textAlign: 'center',
        paddingHorizontal: 40,
    },
    retryBtn: {
        marginTop: 20,
        padding: 12,
        backgroundColor: theme.colors.primary,
        borderRadius: 8,
    },
    retryText: {
        color: '#FFF',
        fontWeight: 'bold',
    },
});