import { GoogleGenerativeAI, Part, Content } from '@google/generative-ai';
import { UserState } from '../../types';

const API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY?.trim();

if (!API_KEY || API_KEY === 'your_api_key_here' || API_KEY.length < 20) {
    console.warn('Gemini API Key is missing or invalid.');
}

let genAI: GoogleGenerativeAI | null = null;
let model: ReturnType<GoogleGenerativeAI['getGenerativeModel']> | null = null;

// Initialize Gemini
if (API_KEY && API_KEY.length >= 20) {
    try {
        genAI = new GoogleGenerativeAI(API_KEY);
        
        // ✅ FIX: Priority set to 'gemini-3-flash-preview' as requested
        const modelNames = [
            'gemini-3-flash-preview', // 1st Priority
            'gemini-2.0-flash-exp',   // Fallback options just in case
            'gemini-1.5-flash',
            'gemini-1.5-pro'
        ];
        
        for (const name of modelNames) {
            try {
                model = genAI.getGenerativeModel({ model: name });
                console.log('Gemini Client initialized using model: ' + name);
                break;
            } catch (err: any) {
                continue;
            }
        }
    } catch (error) {
        console.error('Failed to initialize Gemini client:', error);
    }
}

// Helper: Get the standard model (text/chat)
const getModel = () => {
    if (!genAI) throw new Error('Gemini API not initialized');
    if (model) return model;
    // ✅ FIX: Force use of gemini-3-flash-preview
    model = genAI.getGenerativeModel({ model: 'gemini-3-flash-preview' });
    return model;
};

// Helper: Get a model specifically configured for JSON output
const getJsonModel = () => {
    if (!genAI) throw new Error('Gemini API not initialized');
    // ✅ FIX: Force use of gemini-3-flash-preview for JSON
    return genAI.getGenerativeModel({ 
        model: "gemini-3-flash-preview",
        generationConfig: { responseMimeType: "application/json" }
    });
};

const isApiAvailable = (): boolean => !!genAI && !!API_KEY;

const withTimeout = async <T>(promise: Promise<T>, timeoutMs: number = 30000): Promise<T> => {
    return Promise.race([
        promise,
        new Promise<T>((_, reject) => setTimeout(() => reject(new Error('Request timeout')), timeoutMs))
    ]);
};

// ✅ NEW HELPER: Sanitize JSON string
// Removes Markdown code blocks (```json ... ```) and any conversational text before/after the JSON object.
// This prevents the "Unexpected character: o" error when AI adds intro text.
const cleanJsonString = (str: string): string => {
    try {
        const startIndex = str.indexOf('{');
        const endIndex = str.lastIndexOf('}');
        if (startIndex === -1 || endIndex === -1) return str;
        return str.substring(startIndex, endIndex + 1);
    } catch (e) {
        return str;
    }
};

export const GeminiService = {
    isConfigured: (): boolean => isApiAvailable(),

    // ============================================================
    //  👇 SECTION 1: ROGER'S INSTRUCTOR FEATURES 👇
    // ============================================================
    
    /**
     * Generates a dynamic Instructor Feed based on user state, context, and optional intent.
     */
    async getInstructorFeed(
        userState: UserState, 
        context: { location?: string, weather?: string },
        userIntent?: string
    ) {
        if (!isApiAvailable()) throw new Error('Gemini API key not configured.');
        
        // 1. Define Strategy: "Magazine Editor" Persona + Mandatory Widgets
        const strategies = {
          HEALING: {
            role: "Wellness Editor (Goop / Psychology Today style)",
            // Mandatory: Reflection (Journal), Comfort (Book/Music), Solitude (Place)
            mandatoryWidgets: "journal_prompt, book_list, place_card (quiet spots)",
            focus: "Curating peace, self-love, and mindfulness content."
          },
          DATING: {
            role: "Fashion & Lifestyle Editor (GQ / Vogue / XiaoHongShu style)",
            // Mandatory: Look (Outfit), Talk (Ice Breaker), Go (Place)
            mandatoryWidgets: "outfit_guide, ice_breaker, place_card (social/date spots)",
            focus: "Curating trends, viral date spots, and style guides."
          },
          RELATIONSHIP: {
            role: "Modern Love Columnist (NYT Style)",
            // Mandatory: Do (Date Idea), Give (Gift), Deepen (Discussion)
            mandatoryWidgets: "date_idea, gift_guide, discussion_topic",
            focus: "Curating deep connection activities and meaningful gestures."
          }
        };
    
        const currentStrategy = strategies[userState] || strategies.DATING;
        
        // Handle Secondary Prompt (User Intent)
        let intentInstruction = "";
        if (userIntent) {
            intentInstruction = `
            IMPORTANT UPDATE: The user has a specific request: "${userIntent}".
            IGNORE the standard mandatory widgets. 
            Generate 7 widgets purely based on this specific request.
            `;
        }

        const finalPrompt = `
          Role: ${currentStrategy.role}
          Goal: ${currentStrategy.focus}
          
          User Context:
          - Location: ${context.location || 'Unknown'}
          - Weather: ${context.weather || 'Unknown'}

          ${intentInstruction}

          STRATEGY & STRUCTURE:
          1. **Quantity**: You MUST generate exactly **7 widgets**. (The app will display the top 5, and use the remaining 2 as backup/buffer).
          2. **Mandatory Content** (Unless user requested otherwise):
             Include these 3 types: ${currentStrategy.mandatoryWidgets}.
             Fill the remaining 4 slots with relevant recommendations (e.g., music, movies, tasks).

          CRITICAL VISUAL INSTRUCTION (High Accuracy & Magazine Style):
          The user wants the images to look like "Search Results", not "Generated Art".
          
          1. **Outsource Authority (Cite Sources)**:
             - Attribute ideas to reputable magazines in the 'subtitle' (e.g., "via Vogue", "Seen on Red", "Michelin Guide").
          
          2. **Image Query Strategy ('query' field)**:
             - Do NOT describe a scene (e.g., "A happy couple eating"). 
             - Instead, provide the **Exact Entity Name** to simulate a search fetch.
             - **For Places**: Use "[Place Name] [City] photography" (e.g., "Central Park New York photography").
             - **For Music**: Use "Album cover [Song Name] [Artist]" (e.g., "Album cover Shake it off Taylor Swift").
             - **For Movies**: Use "Official movie poster [Movie Title]" (e.g., "Official movie poster Inception").
             - **For Outfits**: Use "Street style photography [Outfit Description]" (e.g., "Old money aesthetic men suit street style").
          
          3. **Force Carousel Format (Top 5 Lists)**:
             - The following types MUST be lists with exactly 5 items:
             - 'place_card', 'music_playlist', 'book_list', 'movie_list'
             - 'gift_guide', 'date_idea', 'outfit_guide'

          INSTRUCTIONS:
          Generate a valid JSON object. Do NOT use Markdown formatting. Return raw JSON only.

          JSON Structure:
          {
            "screenTitle": "A magazine-style headline",
            "widgets": [
              {
                "id": "unique_string",
                "type": "place_card | book_list | movie_list | music_playlist | outfit_guide | task_card | recipe_card | travel_idea | ice_breaker | date_idea | discussion_topic | gift_guide | journal_prompt", 
                "title": "Engaging Headline",
                "subtitle": "Sub-headline / Source",
                "priority": "high | medium",
                "content": {
                  "description": "Intro text.",
                  
                  // IF CAROUSEL (List) - REQUIRED for Place, Music, Book, Movie, Gift, Date, Outfit:
                  "items": [
                    {
                      "id": "item_1",
                      "title": "Item Name",
                      "subtitle": "Detail (Artist/Author/Source)",
                      "type": "place | music | book | movie | link",
                      "query": "Specific search term (e.g. 'Album cover Blue Mingus', 'Eiffel Tower photography')",
                      "linkQuery": "Browser search term (e.g. 'Miles Davis Blue album spotify')"
                    }
                    // ... exactly 5 items
                  ],

                  // IF SINGLE CARD:
                  "text": "Script body or quote...",
                  "prompt": "Journal question..."
                }
              }
            ]
          }
          
          Generate exactly 7 distinct widgets.
        `;
    
        try {
          const result = await withTimeout(getJsonModel().generateContent(finalPrompt));
          const rawText = result.response.text();
          
          // ✅ FIX: Clean the text before parsing to avoid "Unexpected character" errors
          const cleanedText = cleanJsonString(rawText);
          
          return JSON.parse(cleanedText);
        } catch (error) {
          console.error("Instructor Feed Error:", error);
          return { 
              screenTitle: "Connecting to AI Coach...", 
              widgets: [] 
          };
        }
    },

    // ============================================================
    //  👇 SECTION 2: MASON'S HEALING FEATURES 👇
    // ============================================================

    generateText: async (prompt: string): Promise<string> => {
        if (!isApiAvailable()) throw new Error('Gemini API key not configured.');
        const result = await withTimeout(getModel().generateContent(prompt));
        return result.response.text();
    },

    analyzeImageMood: async (base64Image: string): Promise<string> => {
        if (!isApiAvailable()) throw new Error('Gemini API key not configured.');
        const prompt = 'Analyze this selfie. Return JSON: { "moodScore": number, "emotionalState": "string", "plan": "string" }';
        const imagePart: Part = { inlineData: { data: base64Image, mimeType: 'image/jpeg' } };
        const result = await withTimeout(getModel().generateContent([prompt, imagePart]));
        return result.response.text();
    },

    recommendPlaces: async (latitude: number, longitude: number): Promise<string> => {
        if (!isApiAvailable()) throw new Error('Gemini API key not configured.');
        const prompt = 'I am at ' + latitude + ', ' + longitude + '. Suggest 5 dating spots nearby. Return JSON array.';
        const result = await withTimeout(getModel().generateContent(prompt));
        return result.response.text();
    },

    analyzeAudio: async (base64Audio: string): Promise<string> => {
        if (!isApiAvailable()) throw new Error('Gemini API key not configured.');
        const prompt = 'Analyze this conversation. Return JSON: {"tone": "string", "conflicts": [], "feedback": "string", "suggestions": []}';
        const audioPart: Part = { inlineData: { data: base64Audio, mimeType: 'audio/mp3' } };
        const result = await withTimeout(getModel().generateContent([prompt, audioPart]));
        return result.response.text();
    },

    analyzeVoiceJournal: async (base64Audio: string): Promise<string> => {
        if (!isApiAvailable()) throw new Error('Gemini API key not configured.');
        const prompt = 'Analyze this voice journal entry from someone healing from a breakup. Return JSON: { "transcription": "what they said", "detectedEmotions": ["emotion1"], "emotionIntensity": 5, "voiceToneAnalysis": "tone description", "keyThemes": ["theme1"], "insights": "supportive insight", "affirmation": "affirmation", "suggestion": "suggestion" }. Ensure all text is in English.';
        const audioPart: Part = { inlineData: { data: base64Audio, mimeType: 'audio/m4a' } };
        const result = await withTimeout(getModel().generateContent([prompt, audioPart]), 60000);
        return result.response.text();
    },

    analyzeMemoryPhoto: async (base64Image: string, userContext?: string): Promise<string> => {
        if (!isApiAvailable()) throw new Error('Gemini API key not configured.');
        const context = userContext ? ' User context: ' + userContext : '';
        const prompt = 'Analyze this photo from a past relationship.' + context + ' Return JSON: { "photoDescription": "what you see", "emotionalAcknowledgment": "validation", "reframingQuestions": ["q1", "q2", "q3"], "positiveExtraction": "positive thing", "healedPerspective": "healed view", "closingAffirmation": "encouragement" }. Ensure all text is in English.';
        const imagePart: Part = { inlineData: { data: base64Image, mimeType: 'image/jpeg' } };
        const result = await withTimeout(getModel().generateContent([prompt, imagePart]), 45000);
        return result.response.text();
    },

    healingChat: async (
        userMessage: string, 
        conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }>,
        userContext?: { recentMoods?: number[]; healingDays?: number; recentJournalThemes?: string[] }
    ): Promise<string> => {
        if (!isApiAvailable()) throw new Error('Gemini API key not configured.');
        
        let contextInfo = '';
        if (userContext?.healingDays) contextInfo += ' Healing for ' + userContext.healingDays + ' days.';
        if (userContext?.recentMoods?.length) {
            const avg = userContext.recentMoods.reduce((a, b) => a + b, 0) / userContext.recentMoods.length;
            contextInfo += ' Mood avg: ' + avg.toFixed(1) + '/5.';
        }

        const systemPrompt = 'You are a warm, empathetic AI companion helping someone heal from a breakup. Use CBT techniques and self-compassion. Keep responses to 2-4 paragraphs. Communicate in English.' + contextInfo;

        const contents: Content[] = [
            { role: 'user', parts: [{ text: systemPrompt }] },
            { role: 'model', parts: [{ text: 'I am here to support you. How are you feeling today?' }] }
        ];

        for (const msg of conversationHistory) {
            contents.push({ role: msg.role === 'user' ? 'user' : 'model', parts: [{ text: msg.content }] });
        }
        contents.push({ role: 'user', parts: [{ text: userMessage }] });

        const chat = getModel().startChat({ history: contents.slice(0, -1) });
        const result = await withTimeout(chat.sendMessage(userMessage), 30000);
        return result.response.text();
    },

    generateAffirmation: async (mood: number, context?: string): Promise<string> => {
        if (!isApiAvailable()) return 'Your feelings are valid. Healing takes time.';
        try {
            const moodDesc = mood <= 2 ? 'struggling' : mood <= 3 ? 'neutral' : 'doing well';
            const prompt = 'Generate a warm affirmation in English for someone ' + moodDesc + ' while healing from a breakup. 1-2 sentences.';
            const result = await withTimeout(getModel().generateContent(prompt));
            return result.response.text().trim();
        } catch (e) {
            return 'Your feelings are valid. Healing takes time.';
        }
    },

    analyzeMoodPatterns: async (moodLogs: Array<{ date: string; value: number; note?: string }>): Promise<string> => {
        if (!isApiAvailable()) throw new Error('Gemini API key not configured.');
        const prompt = 'Analyze these mood logs: ' + JSON.stringify(moodLogs) + '. Return JSON in English: { "overallTrend": "improving/declining/stable", "averageMood": number, "patterns": ["pattern1"], "triggers": ["trigger1"], "encouragement": "positive observation", "suggestions": ["suggestion1"] }';
        const result = await withTimeout(getModel().generateContent(prompt));
        return result.response.text();
    }
};