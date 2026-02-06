import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
    User, MoodLog, MatchProfile, Match, ChatMessage, RelationshipCheckResult,
    VoiceJournalEntry, HealedMemory, HealingChatMessage, HealingChatSession,
    MoodPatternInsights, DailyAffirmation, DatingCheckIn,
    UserState // <--- Imported from types
} from '../types';

// Helper: Get today's date as YYYY-MM-DD
const getTodayDateString = (): string => {
    return new Date().toISOString().split('T')[0];
};

// ============================================================
// 👇 FEATURE UNLOCK REQUIREMENTS
// ============================================================
const HEALING_DAYS_REQUIRED = 7;  // Days of healing before dating unlocks
const DATING_CHECKINS_REQUIRED = 30; // Check-ins before full dating access
const MATCHES_FOR_RELATIONSHIP = 3; // Matches needed for relationship coaching

interface AppState {
    user: User | null;
    savedMatches: MatchProfile[];
    matches: Match[];
    chatMessages: ChatMessage[];
    moodLogs: MoodLog[];
    completedTasks: string[];
    checkInHistory: RelationshipCheckResult[];

    // ============================================================
    // 👇 PHASE-BASED FEATURE UNLOCK SYSTEM
    // ============================================================
    datingCheckIns: DatingCheckIn[];
    datingUnlocked: boolean;
    healingCompleted: boolean;      // NEW: Track if healing phase is complete
    relationshipUnlocked: boolean;  // NEW: Track if relationship features unlocked
    demoMode: boolean;              // NEW: Demo mode unlocks everything

    // ============================================================
    // 👇 Global App State (Instructor & Onboarding)
    // ============================================================
    userState: UserState;
    hasCompletedOnboarding: boolean;

    // ============================================================
    // 👇 User Location for Maps
    // ============================================================
    userLocation: { latitude: number; longitude: number } | null;

    // ============================================================
    // 👇 Healing Features (Mason's)
    // ============================================================
    voiceJournals: VoiceJournalEntry[];
    healedMemories: HealedMemory[];
    healingChatSessions: HealingChatSession[];
    currentHealingChat: HealingChatSession | null;
    moodInsights: MoodPatternInsights | null;
    todayAffirmation: DailyAffirmation | null;

    // ============================================================
    // 👇 Actions
    // ============================================================
    setUser: (user: User) => void;

    // Instructor / Onboarding Actions
    setUserState: (state: UserState) => void;
    completeOnboarding: () => void;
    resetOnboarding: () => void;

    // ============================================================
    // 👇 FEATURE UNLOCK ACTIONS (NEW!)
    // ============================================================
    canAccessHealing: () => boolean;
    canAccessDating: () => boolean;
    canAccessCoaching: () => boolean;
    getUnlockProgress: () => { healing: number; dating: number; relationship: number };
    completeHealingPhase: () => void;
    unlockDating: () => void;
    unlockRelationship: () => void;
    toggleDemoMode: () => void;
    resetAllProgress: () => void;
    setUserLocation: (location: { latitude: number; longitude: number }) => void;

    // Dating Check-in Actions
    checkInForDating: () => boolean;
    hasCheckedInToday: () => boolean;
    getDatingCheckInCount: () => number;
    skipDatingCheckIn: () => void;
    resetDatingCheckIn: () => void;

    // Dating Actions
    saveMatch: (match: MatchProfile) => Match | null;
    checkForMutualMatch: (matchId: string) => Match | null;
    addChatMessage: (message: ChatMessage) => void;

    // General Actions
    logMood: (mood: MoodLog) => void;
    toggleTaskCompletion: (taskId: string) => void;
    addCheckInResult: (result: RelationshipCheckResult) => void;

    // Healing Actions
    addVoiceJournal: (entry: VoiceJournalEntry) => void;
    deleteVoiceJournal: (id: string) => void;
    addHealedMemory: (memory: HealedMemory) => void;
    updateHealedMemory: (id: string, updates: Partial<HealedMemory>) => void;
    deleteHealedMemory: (id: string) => void;
    startHealingChat: () => HealingChatSession;
    addHealingChatMessage: (message: HealingChatMessage) => void;
    endHealingChat: (summary?: string) => void;
    loadHealingChatSession: (sessionId: string) => void;
    setMoodInsights: (insights: MoodPatternInsights) => void;
    setTodayAffirmation: (affirmation: DailyAffirmation) => void;
    getHealingDays: () => number;
    getRecentMoods: (days?: number) => number[];
    getRecentJournalThemes: () => string[];
}

export const useAppStore = create<AppState>()(
    persist(
        (set, get) => ({
            // --- Initial State ---
            user: {
                id: 'u1',
                name: 'User',
                age: 25,
                status: 'healing',
                interests: [],
                healingStartDate: new Date().toISOString(),
            },

            // Default App State
            userState: 'HEALING', // Start in healing mode
            hasCompletedOnboarding: false,

            savedMatches: [],
            matches: [],
            chatMessages: [],
            moodLogs: [],
            completedTasks: [],
            checkInHistory: [],

            // Phase-Based Unlock State
            datingCheckIns: [],
            datingUnlocked: false,
            healingCompleted: false,
            relationshipUnlocked: false,
            demoMode: false,

            // User Location
            userLocation: null,

            // Healing Initial State
            voiceJournals: [],
            healedMemories: [],
            healingChatSessions: [],
            currentHealingChat: null,
            moodInsights: null,
            todayAffirmation: null,

            // --- Actions ---

            setUser: (user) => set({ user }),
            setUserState: (state) => set({ userState: state }),
            completeOnboarding: () => set({ hasCompletedOnboarding: true }),
            resetOnboarding: () => set({ hasCompletedOnboarding: false }),

            // ============================================================
            // 👇 FEATURE UNLOCK LOGIC
            // ============================================================

            canAccessHealing: () => {
                // Healing is always accessible
                return true;
            },

            canAccessDating: () => {
                const state = get();
                if (state.demoMode) return true;
                // Must complete healing phase OR have 7+ days of healing
                const healingDays = state.user?.healingStartDate 
                    ? Math.ceil((Date.now() - new Date(state.user.healingStartDate).getTime()) / (1000 * 60 * 60 * 24))
                    : 0;
                return state.healingCompleted || state.datingUnlocked || healingDays >= HEALING_DAYS_REQUIRED;
            },

            canAccessCoaching: () => {
                const state = get();
                if (state.demoMode) return true;
                // Must have matches OR relationship unlocked
                return state.relationshipUnlocked || state.matches.length >= MATCHES_FOR_RELATIONSHIP;
            },

            getUnlockProgress: () => {
                const state = get();
                const healingDays = state.user?.healingStartDate 
                    ? Math.ceil((Date.now() - new Date(state.user.healingStartDate).getTime()) / (1000 * 60 * 60 * 24))
                    : 0;
                
                return {
                    healing: Math.min(100, (healingDays / HEALING_DAYS_REQUIRED) * 100),
                    dating: Math.min(100, (state.datingCheckIns.length / DATING_CHECKINS_REQUIRED) * 100),
                    relationship: Math.min(100, (state.matches.length / MATCHES_FOR_RELATIONSHIP) * 100),
                };
            },

            completeHealingPhase: () => {
                set({ healingCompleted: true, userState: 'DATING' });
            },

            unlockDating: () => {
                set({ datingUnlocked: true, healingCompleted: true });
            },

            unlockRelationship: () => {
                set({ relationshipUnlocked: true, userState: 'RELATIONSHIP' });
            },

            toggleDemoMode: () => {
                const current = get().demoMode;
                set({ 
                    demoMode: !current,
                    healingCompleted: !current,
                    datingUnlocked: !current,
                    relationshipUnlocked: !current,
                });
            },

            resetAllProgress: () => {
                set({
                    healingCompleted: false,
                    datingUnlocked: false,
                    relationshipUnlocked: false,
                    demoMode: false,
                    datingCheckIns: [],
                    matches: [],
                    savedMatches: [],
                    userState: 'HEALING',
                    hasCompletedOnboarding: false,
                });
            },

            setUserLocation: (location) => set({ userLocation: location }),

            // ============================================================
            // 👇 Dating Check-in Actions
            // ============================================================

            checkInForDating: () => {
                const state = get();
                const today = getTodayDateString();

                const alreadyCheckedIn = state.datingCheckIns.some(c => c.date === today);
                if (alreadyCheckedIn) return false;

                const newCheckIn: DatingCheckIn = {
                    id: `checkin_${Date.now()}`,
                    date: today,
                    completed: true,
                };

                set({ datingCheckIns: [...state.datingCheckIns, newCheckIn] });

                if (state.datingCheckIns.length + 1 >= DATING_CHECKINS_REQUIRED) {
                    set({ datingUnlocked: true });
                }

                return true;
            },

            hasCheckedInToday: () => {
                const today = getTodayDateString();
                return get().datingCheckIns.some(c => c.date === today);
            },

            getDatingCheckInCount: () => {
                return get().datingCheckIns.length;
            },

            skipDatingCheckIn: () => {
                set({ datingUnlocked: true });
            },

            resetDatingCheckIn: () => {
                set({ datingCheckIns: [], datingUnlocked: false });
            },

            saveMatch: (match) => {
                const state = get();

                // Check if already matched
                const existing = state.matches.find(m => m.matchProfile.id === match.id);
                if (existing) {
                    return existing;
                }

                // Add to liked list
                set({ savedMatches: [...state.savedMatches, { ...match, likedAt: new Date().toISOString() }] });

                // Always create a match when swiping right (for demo/testing)
                const newMatch: Match = {
                    id: `match_${match.id}`,
                    matchProfile: { ...match, likedAt: new Date().toISOString() },
                    matchedAt: new Date().toISOString(),
                    unreadCount: 0,
                };
                set((s) => ({ matches: [...s.matches, newMatch] }));
                return newMatch;
            },

            checkForMutualMatch: (matchId) => get().matches.find(m => m.matchProfile.id === matchId) || null,

            addChatMessage: (message) => set((state) => ({
                chatMessages: [...state.chatMessages, message],
                matches: state.matches.map(m => m.id === message.matchId
                    ? { ...m, lastMessageAt: message.timestamp, unreadCount: message.senderId !== 'user' ? m.unreadCount + 1 : m.unreadCount }
                    : m
                ),
            })),

            logMood: (mood) => set((s) => ({ moodLogs: [mood, ...s.moodLogs] })),

            toggleTaskCompletion: (taskId) => set((s) => ({
                completedTasks: s.completedTasks.includes(taskId)
                    ? s.completedTasks.filter(id => id !== taskId)
                    : [...s.completedTasks, taskId],
            })),

            addCheckInResult: (result) => set((s) => ({ checkInHistory: [result, ...s.checkInHistory] })),

            // --- Healing Actions Implementation ---

            addVoiceJournal: (entry) => set((s) => ({ voiceJournals: [entry, ...s.voiceJournals] })),
            deleteVoiceJournal: (id) => set((s) => ({ voiceJournals: s.voiceJournals.filter(j => j.id !== id) })),

            addHealedMemory: (memory) => set((s) => ({ healedMemories: [memory, ...s.healedMemories] })),
            updateHealedMemory: (id, updates) => set((s) => ({
                healedMemories: s.healedMemories.map(m => m.id === id ? { ...m, ...updates } : m)
            })),
            deleteHealedMemory: (id) => set((s) => ({ healedMemories: s.healedMemories.filter(m => m.id !== id) })),

            startHealingChat: () => {
                const session: HealingChatSession = {
                    id: `chat_${Date.now()}`,
                    startedAt: new Date().toISOString(),
                    lastMessageAt: new Date().toISOString(),
                    messages: [],
                };
                set({ currentHealingChat: session });
                return session;
            },

            addHealingChatMessage: (message) => set((s) => {
                if (!s.currentHealingChat) return s;
                return {
                    currentHealingChat: {
                        ...s.currentHealingChat,
                        lastMessageAt: message.timestamp,
                        messages: [...s.currentHealingChat.messages, message],
                    }
                };
            }),

            endHealingChat: (summary) => set((s) => {
                if (!s.currentHealingChat) return s;
                return {
                    currentHealingChat: null,
                    healingChatSessions: [{ ...s.currentHealingChat, summary }, ...s.healingChatSessions],
                };
            }),

            loadHealingChatSession: (sessionId) => set((s) => {
                const session = s.healingChatSessions.find(sess => sess.id === sessionId);
                return session ? { currentHealingChat: session } : s;
            }),

            setMoodInsights: (insights) => set({ moodInsights: insights }),
            setTodayAffirmation: (affirmation) => set({ todayAffirmation: affirmation }),

            getHealingDays: () => {
                const state = get();
                if (!state.user?.healingStartDate) return 0;
                const diff = Date.now() - new Date(state.user.healingStartDate).getTime();
                return Math.ceil(diff / (1000 * 60 * 60 * 24));
            },

            getRecentMoods: (days = 7) => {
                const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
                return get().moodLogs.filter(log => new Date(log.date).getTime() >= cutoff).map(log => log.value);
            },

            getRecentJournalThemes: () => {
                const themes = get().voiceJournals.slice(0, 5).flatMap(j => j.keyThemes);
                return [...new Set(themes)];
            },
        }),
        {
            name: 'recbreak-storage', // Key for AsyncStorage
            storage: createJSONStorage(() => AsyncStorage), // Persist data to device storage
        }
    )
);