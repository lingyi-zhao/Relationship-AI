// ==========================================
// 1. User & Profile Types
// ==========================================

// Existing status type (kept for backward compatibility with profile data)
export type UserStatus = 'single' | 'relationship' | 'healing' | 'growth';

// NEW: Strict App Mode State for the Instructor/Navigation logic
export type UserState = 'HEALING' | 'DATING' | 'RELATIONSHIP';

export interface User {
  id: string;
  name: string;
  age: number;
  status: UserStatus;
  interests: string[];
  // Extended profile data for the wizard flow
  extendedProfile?: {
    gender: string;
    location: string;
    height: string;
    weight: string;
    company: string;
    jobTitle: string;
    school: string;
    degree: string;
    datingGoal: string;
  };
  attachmentStyle?: string;
  healingStartDate?: string;
  location?: string; // Fallback location
}

// ==========================================
// 2. Dating & Matching Types
// ==========================================

export interface MatchProfile {
  id: string;
  name: string;
  age: number;
  bio: string;
  interests: string[];
  compatibilityScore: number;
  imageUrl?: string;
  likedAt?: string;
  // NEW: Extended matching fields
  gender?: string;
  location?: string;
  datingGoal?: string;
}

export interface Match {
  id: string;
  matchProfile: MatchProfile;
  matchedAt: string;
  lastMessageAt?: string;
  unreadCount: number;
}

export interface ChatMessage {
  id: string;
  matchId: string;
  senderId: string;
  text: string;
  timestamp: string;
  type: 'text' | 'suggestion' | 'icebreaker';
}

export interface ConversationStarter {
  id: string;
  text: string;
  category: 'fun' | 'deep' | 'intimate' | 'adventure' | 'romantic';
  emoji: string;
}

export interface DatingSpot {
  name: string;
  description: string;
  reason: string;
  latitude: number;
  longitude: number;
}

// NEW: Dating Check-in Type
export interface DatingCheckIn {
  id: string;
  date: string;  // ISO date string (YYYY-MM-DD)
  completed: boolean;
}

// ==========================================
// 3. Healing & Growth Types (Mason's Section)
// ==========================================

export interface MoodLog {
  id: string;
  date: string;
  value: 1 | 2 | 3 | 4 | 5;
  note?: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  category: 'self-care' | 'reflection' | 'social';
  isCompleted: boolean;
}

export interface RelationshipCheckResult {
  date: string;
  score: number;
  summary: 'Healthy' | 'Needs Work' | 'Unhealthy';
  advice: string;
}

export interface Insight {
  id: string;
  title: string;
  description: string;
  dateGenerated: string;
}

// Voice Journal Entry
export interface VoiceJournalEntry {
  id: string;
  date: string;
  audioUri?: string;
  duration: number;
  transcription: string;
  detectedEmotions: string[];
  emotionIntensity: number;
  voiceToneAnalysis: string;
  keyThemes: string[];
  insights: string;
  affirmation: string;
  suggestion: string;
}

// Healed Memory
export interface HealedMemory {
  id: string;
  date: string;
  imageUri?: string;
  userContext?: string;
  photoDescription: string;
  emotionalAcknowledgment: string;
  reframingQuestions: string[];
  positiveExtraction: string;
  healedPerspective: string;
  closingAffirmation: string;
  userResponses?: { questionIndex: number; response: string }[];
  isProcessed: boolean;
}

// Healing Chat
export interface HealingChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface HealingChatSession {
  id: string;
  startedAt: string;
  lastMessageAt: string;
  messages: HealingChatMessage[];
  summary?: string;
}

export interface MoodPatternInsights {
  id: string;
  generatedAt: string;
  overallTrend: 'improving' | 'declining' | 'stable';
  averageMood: number;
  patterns: string[];
  triggers: string[];
  encouragement: string;
  suggestions: string[];
}

export interface DailyAffirmation {
  id: string;
  date: string;
  text: string;
  mood: number;
}

// ==========================================
// 4. NEW: Instructor / Coaching Types (Roger's Section)
// ==========================================

/**
 * Defines the comprehensive list of widget types the AI can generate.
 * Expanded to cover Healing, Dating, and Relationship maintenance scenarios.
 */
export type WidgetType = 
  // --- Lifestyle & Locations ---
  | 'place_card'           // Restaurant, Cafe, Park, or Spot recommendations
  | 'outfit_guide'         // OOTD suggestions based on occasion/weather
  
  // --- Content & Media ---
  | 'book_list'            // Recommended reading (Healing or Relationship growth)
  | 'movie_list'           // Movies/Series for "Netflix & Chill" or distraction
  | 'music_playlist'       // Song recommendations for mood setting

  // --- Actions & Tasks ---
  | 'task_card'            // Actionable items (e.g., "Clean room", "Call mom")
  | 'recipe_card'          // Cooking ideas for date night or comfort food 
  | 'travel_idea'          // Weekend getaway or vacation planning

  // --- Social & Communication ---
  | 'ice_breaker'          // Witty lines for dating apps
  | 'date_idea'            // Specific activity (e.g., "Pottery Class")
  | 'discussion_topic'     // Deep questions to ask a partner
  | 'communication_script' // Templates for difficult conversations (e.g., "How to define the relationship")
  | 'apology_template'     // How to apologize effectively

  // --- Relationship Maintenance ---
  | 'gift_guide'           // Gift ideas for anniversaries or "just because" 
  | 'conflict_resolution'  // Steps to de-escalate an argument
  | 'finance_tip'          // Advice on splitting bills or managing couple finances
  | 'intimacy_exercise'    // Exercises to build physical or emotional intimacy
  | 'love_language_act'    // Specific small acts based on love languages

  // --- Healing Specific ---
  | 'journal_prompt'       // Specific writing prompt for reflection
  | 'meditation_exercise'; // Mindfulness or breathing exercise


/**
 * NEW: Represents a single item in a "Top 5" Carousel list.
 * This is used for horizontal scrolling cards (Places, Books, Music).
 */
export interface InstructorItem {
  id: string;
  title: string;
  subtitle: string;
  type: 'place' | 'music' | 'movie' | 'book' | 'link';
  
  /** * Keyword used to generate the AI image (e.g., "Central Park sunny", "Taylor Swift album cover")
   */
  query: string; 
  
  /**
   * Keyword used for the external link search (e.g., "Central Park Map", "Song Name Spotify")
   */
  linkQuery?: string; 
}

/**
 * Represents a single dynamic card in the Instructor feed.
 */
export interface InstructorWidget {
  id: string;
  type: WidgetType;
  title: string;
  subtitle?: string;
  
  /**
   * Dynamic content payload.
   * - description: A brief intro text.
   * - items: An array of items for Carousel widgets (Top 5 lists).
   * - ...other fields for specific text-based widgets.
   */
  content: {
    description?: string;
    items?: InstructorItem[]; // ✅ Added for Carousel support
    [key: string]: any;       // Allow flexibility for other fields (e.g. scriptLines, tips)
  };
  
  /**
   * Determines the visual size/prominence of the card.
   */
  priority: 'high' | 'medium' | 'low';
  
  actionLabel?: string; // Optional text for the button (e.g., "View Map", "Read Script")
}

/**
 * Represents the entire feed structure returned by Gemini.
 * The AI acts as an "Editor", curating this list based on user context.
 */
export interface InstructorFeed {
  screenTitle: string; 
  widgets: InstructorWidget[];
}

// ==========================================
// 5. Navigation Types
// ==========================================

export type RootTabParamList = {
  Healing: undefined;    // Tab 1: Mason
  Dating: undefined;     // Tab 2: Ao Chen
  Instructor: undefined; // Tab 3: Roger
  Settings: undefined;   // Tab 4: Profile & Config
  
  // Legacy/Optional
  Relationship: undefined; 
  Growth: undefined;
};

export type RootStackParamList = {
  Main: undefined;
  Chat: { matchId: string };
  Onboarding: undefined; // For the initial wizard flow
};