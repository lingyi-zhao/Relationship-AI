import { ConversationStarter } from '../types';

export const CONVERSATION_STARTERS: ConversationStarter[] = [
    // Fun & Light
    { id: 'fun1', text: 'What\'s the most spontaneous thing you\'ve done recently?', category: 'fun', emoji: '🎲' },
    { id: 'fun2', text: 'If you could have any superpower, what would it be?', category: 'fun', emoji: '🦸' },
    { id: 'fun3', text: 'What\'s your go-to karaoke song?', category: 'fun', emoji: '🎤' },
    { id: 'fun4', text: 'What\'s something that always makes you laugh?', category: 'fun', emoji: '😂' },
    
    // Deep & Meaningful
    { id: 'deep1', text: 'What\'s a life lesson you learned the hard way?', category: 'deep', emoji: '💭' },
    { id: 'deep2', text: 'What does your ideal future look like?', category: 'deep', emoji: '🔮' },
    { id: 'deep3', text: 'What\'s something you\'re grateful for today?', category: 'deep', emoji: '🙏' },
    { id: 'deep4', text: 'What\'s a goal you\'re working towards right now?', category: 'deep', emoji: '🎯' },
    
    // Intimate & Personal
    { id: 'intimate1', text: 'What makes you feel most loved?', category: 'intimate', emoji: '💕' },
    { id: 'intimate2', text: 'How do you like to be comforted when you\'re stressed?', category: 'intimate', emoji: '🤗' },
    { id: 'intimate3', text: 'What\'s your love language?', category: 'intimate', emoji: '💌' },
    { id: 'intimate4', text: 'What\'s something you\'re afraid to admit but want to share?', category: 'intimate', emoji: '💝' },
    { id: 'intimate5', text: 'What does intimacy mean to you?', category: 'intimate', emoji: '🌹' },
    { id: 'intimate6', text: 'How do you express affection?', category: 'intimate', emoji: '💋' },
    
    // Adventure & Excitement
    { id: 'adventure1', text: 'What\'s on your bucket list?', category: 'adventure', emoji: '✈️' },
    { id: 'adventure2', text: 'Where\'s your dream vacation spot?', category: 'adventure', emoji: '🏝️' },
    { id: 'adventure3', text: 'What\'s an adventure you\'ve always wanted to try?', category: 'adventure', emoji: '🏔️' },
    
    // Romantic & Sweet
    { id: 'romantic1', text: 'What\'s your idea of a perfect date?', category: 'romantic', emoji: '🌹' },
    { id: 'romantic2', text: 'What\'s the most romantic thing someone has done for you?', category: 'romantic', emoji: '💐' },
    { id: 'romantic3', text: 'What makes you feel most connected to someone?', category: 'romantic', emoji: '💑' },
    { id: 'romantic4', text: 'How do you show someone you care about them?', category: 'romantic', emoji: '💖' },
];

export const getStartersByCategory = (category: ConversationStarter['category']) => {
    return CONVERSATION_STARTERS.filter(starter => starter.category === category);
};

export const getIntimateStarters = () => {
    return getStartersByCategory('intimate');
};

