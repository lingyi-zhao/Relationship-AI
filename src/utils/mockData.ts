import { MatchProfile, Task } from '../types';

// ============================================================
// PREMIUM PROFILE IMAGES (Using Unsplash for high-quality photos)
// ============================================================
const PROFILE_IMAGES = {
    male: [
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face',
        'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=face',
        'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face',
        'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop&crop=face',
        'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=400&h=400&fit=crop&crop=face',
    ],
    female: [
        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop&crop=face',
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop&crop=face',
        'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&h=400&fit=crop&crop=face',
        'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&h=400&fit=crop&crop=face',
        'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=400&h=400&fit=crop&crop=face',
    ],
    nonbinary: [
        'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&h=400&fit=crop&crop=face',
        'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=400&h=400&fit=crop&crop=face',
    ],
};

// ============================================================
// 模拟用户档案 - 用于 Dating Tab 配对 (WITH IMAGES!)
// ============================================================
export const MOCK_MATCHES: MatchProfile[] = [
    {
        id: '1',
        name: 'Alex',
        age: 28,
        bio: 'Love hiking and photography. Looking for someone to explore the world with. 📸🏔️',
        interests: ['Hiking', 'Photography', 'Coffee', 'Travel'],
        compatibilityScore: 92,
        gender: 'Male',
        location: 'New York',
        datingGoal: 'Long-term relationship',
        imageUrl: PROFILE_IMAGES.male[0],
    },
    {
        id: '2',
        name: 'Jordan',
        age: 26,
        bio: "Artist and foodie. Let's find the best tacos in town. 🎨🌮",
        interests: ['Art', 'Foodie', 'Music', 'Movies'],
        compatibilityScore: 85,
        gender: 'Female',
        location: 'Los Angeles',
        datingGoal: 'Casual dating',
        imageUrl: PROFILE_IMAGES.female[0],
    },
    {
        id: '3',
        name: 'Sam',
        age: 29,
        bio: 'Tech geek and bookworm. Always ready for a deep conversation. 💻📚',
        interests: ['Tech', 'Reading', 'Sci-Fi', 'Gaming'],
        compatibilityScore: 78,
        gender: 'Male',
        location: 'San Francisco',
        datingGoal: 'Long-term relationship',
        imageUrl: PROFILE_IMAGES.male[1],
    },
    {
        id: '4',
        name: 'Taylor',
        age: 27,
        bio: 'Yoga instructor and plant parent. Positive vibes only. 🧘‍♀️🌱',
        interests: ['Yoga', 'Plants', 'Meditation', 'Wellness'],
        compatibilityScore: 88,
        gender: 'Female',
        location: 'Austin',
        datingGoal: 'Serious relationship',
        imageUrl: PROFILE_IMAGES.female[1],
    },
    {
        id: '5',
        name: 'Morgan',
        age: 25,
        bio: 'Music producer by day, DJ by night. Looking for my duet partner. 🎵🎧',
        interests: ['Music', 'DJing', 'Concerts', 'Dancing'],
        compatibilityScore: 81,
        gender: 'Non-binary',
        location: 'Miami',
        datingGoal: 'Open to anything',
        imageUrl: PROFILE_IMAGES.nonbinary[0],
    },
    {
        id: '6',
        name: 'Riley',
        age: 30,
        bio: 'Coffee addict and startup founder. Work hard, play harder. ☕🚀',
        interests: ['Coffee', 'Startups', 'Running', 'Networking'],
        compatibilityScore: 75,
        gender: 'Female',
        location: 'Seattle',
        datingGoal: 'Long-term relationship',
        imageUrl: PROFILE_IMAGES.female[2],
    },
    {
        id: '7',
        name: 'Casey',
        age: 24,
        bio: 'Adventure seeker and thrill chaser. Skydiving is my cardio. 🪂⛰️',
        interests: ['Adventure', 'Skydiving', 'Travel', 'Hiking'],
        compatibilityScore: 90,
        gender: 'Male',
        location: 'Denver',
        datingGoal: 'Fun & adventures',
        imageUrl: PROFILE_IMAGES.male[2],
    },
    {
        id: '8',
        name: 'Jamie',
        age: 28,
        bio: "Chef and food blogger. I'll cook you the best meal of your life. 👨‍🍳🍷",
        interests: ['Cooking', 'Food', 'Wine', 'Travel'],
        compatibilityScore: 86,
        gender: 'Female',
        location: 'Chicago',
        datingGoal: 'Serious relationship',
        imageUrl: PROFILE_IMAGES.female[3],
    },
    {
        id: '9',
        name: 'Emma',
        age: 26,
        bio: 'Graduate student and part-time yoga instructor. Love a good book and better coffee. 📖☕',
        interests: ['Reading', 'Yoga', 'Coffee', 'Nature'],
        compatibilityScore: 89,
        gender: 'Female',
        location: 'Boston',
        datingGoal: 'Long-term relationship',
        imageUrl: PROFILE_IMAGES.female[4],
    },
    {
        id: '10',
        name: 'Liam',
        age: 31,
        bio: 'Architect with a passion for sustainable design. Weekends are for hiking. 🏛️🥾',
        interests: ['Architecture', 'Sustainability', 'Hiking', 'Art'],
        compatibilityScore: 84,
        gender: 'Male',
        location: 'Portland',
        datingGoal: 'Serious relationship',
        imageUrl: PROFILE_IMAGES.male[3],
    },
];

// ============================================================
// Healing 任务数据
// ============================================================
export const HEALING_TASKS: Task[] = [
    {
        id: 't1',
        title: 'Morning Journal',
        description: 'Write down 3 things you are grateful for today.',
        category: 'reflection',
        isCompleted: false,
    },
    {
        id: 't2',
        title: 'Walk in Nature',
        description: 'Take a 15-minute walk outside without your phone.',
        category: 'self-care',
        isCompleted: false,
    },
    {
        id: 't3',
        title: 'Reach out to a Friend',
        description: "Send a text to a friend you haven't spoken to in a while.",
        category: 'social',
        isCompleted: false,
    },
    {
        id: 't4',
        title: 'Hydrate',
        description: 'Drink a full glass of water right now.',
        category: 'self-care',
        isCompleted: false,
    },
];

// ============================================================
// 关系问卷数据
// ============================================================
export const RELATIONSHIP_QUESTIONS = [
    {
        id: 'q1',
        question: 'How often do you feel heard by your partner?',
        options: ['Always', 'Most of the time', 'Sometimes', 'Rarely'],
    },
    {
        id: 'q2',
        question: 'When you argue, do you resolve the issue?',
        options: ['Yes, fully', 'Usually', 'Sometimes we just stop talking', 'No, it lingers'],
    },
    {
        id: 'q3',
        question: 'Do you feel supported in your personal goals?',
        options: ['Very supported', 'Somewhat', 'Neutral', 'Not really'],
    },
];

// ============================================================
// Helper: 计算用户匹配度
// ============================================================
export const calculateCompatibility = (
    userInterests: string[],
    profileInterests: string[]
): number => {
    if (userInterests.length === 0 || profileInterests.length === 0) {
        return Math.floor(Math.random() * 30) + 60; // Random 60-90 if no data
    }

    const userSet = new Set(userInterests.map(i => i.toLowerCase()));
    const matches = profileInterests.filter(i => userSet.has(i.toLowerCase()));
    const matchRatio = matches.length / Math.max(userInterests.length, profileInterests.length);

    // Score: 50 base + up to 50 based on matching
    return Math.floor(50 + matchRatio * 50);
};
