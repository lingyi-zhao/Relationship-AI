# ❤️ RelationshipAI

**Your Personal AI Companion for Every Stage of Love.**

RelationshipAI is an intelligent relationship coaching app built with **React Native (Expo)** and powered by **Google Gemini AI**. It dynamically adapts its interface, features, and AI advice based on the user's current relationship status (Healing, Dating, or In a Relationship) to provide the most relevant companionship.

![Project Status](https://img.shields.io/badge/Status-Development-blue) ![Expo](https://img.shields.io/badge/Expo-Go-black) ![AI](https://img.shields.io/badge/Powered%20by-Gemini-orange)

---

## ✨ Key Features

### 1. 🧠 Context-Aware AI Coach
* **Dynamic Widget Feed**: Generates personalized daily advice based on your relationship status and location.
    * 💔 **Healing Mode**: Recommends healing book lists, quiet spots for solitude, and self-care tasks.
    * 🔥 **Dating Mode**: Suggests Outfit of the Day (OOTD), trendy restaurants/bars, and witty ice-breakers.
    * 💖 **Relationship Mode**: Recommends anniversary gifts, deep conversation cards, and unique date ideas.
* **Powered by Gemini 1.5 Flash**: Utilizes the latest Google model to generate structured JSON advice.

### 2. 🌱 Smart Onboarding
* **5-Step Wizard**: A guided form to collect nickname, demographics, career info, detailed interests, and dating goals.
* **Searchable Location Picker**: Built-in searchable dropdown to accurately set your city (US States/Cities database).
* **Interest Tags**: Multi-select chips to optimize the AI recommendation algorithm.

### 3. 🔄 Dynamic Navigation & State
* **Auto-Routing**: Automatically navigates users to the most relevant home tab (Healing vs. Dating) upon completing onboarding based on their status.
* **Theme Adaptation**: The UI color scheme changes dynamically (Pink/Coral/Purple) to match the current mode.

### 4. ⚙️ Profile & Settings
* **Status Switcher**: Easily switch between relationship modes via a modal without resetting your account.
* **Location Editor**: Update your "Current City" anytime to get local date spots and activity recommendations.
* **Data Reset**: Includes a "Danger Zone" to fully wipe app data and restart the onboarding process.

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Gemini API Key

1. Get your API key from [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Create a `.env` file in the root directory:
   ```
   EXPO_PUBLIC_GEMINI_API_KEY=your_actual_api_key_here
   ```
3. Make sure `.env` is in your `.gitignore` (it already is)

### 3. Run the App

```bash
# Start Expo
npm start

# Run on iOS
npm run ios

# Run on Android
npm run android

# Run on Web
npm run web
```

## Tech Stack

- **Framework**: Expo (React Native)
- **Language**: TypeScript
- **State Management**: Zustand
- **Navigation**: React Navigation
- **AI**: Google Gemini API
- **Maps**: react-native-maps
- **Theme**: Custom "Soft Coral & Teal" design system

## Project Structure

```
src/
├── components/         # Shared components
│   ├── CarouselWidget.tsx    # [NEW] Horizontal scroll list for "Top 5" recommendations
│   ├── InteractiveWidget.tsx # [NEW] Wrapper for swipeable cards with overlay actions
│   ├── WidgetRenderer.tsx    # [UPDATED] Factory logic: decides between Carousel vs Standard Card
│   ├── MyCard.tsx            # Base visual component for cards
│   └── ScreenWrapper.tsx     # Standard screen layout wrapper
├── navigation/         # Navigation setup (TabNavigator, RootStack)
├── screens/
│   ├── onboarding/     # Registration flow (Wizard Form)
│   ├── dating/         # Dating features (Swipe & Match)
│   ├── healing/        # Healing features (Journal & Meditation)
│   ├── instructor/     # AI Coach (Dynamic Feed)
│   │   └── InstructorScreen.tsx  # [UPDATED] Implements "7-fetch, 5-show" & auto-refill logic
│   └── settings/       # User Profile (Location Edit, Status Switch)
├── services/
│   └── gemini/
│       └── client.ts   # [UPDATED] Magazine Editor Persona, JSON sanitizer, & Visual Prompts
├── state/              # Zustand Store (store.ts)
├── theme/              # Global theme variables (Colors, Spacing)
└── types/              # TypeScript type definitions
    └── index.ts        # [UPDATED] Added InstructorItem & expanded Widget types
```

## Environment Variables

The app uses Expo's environment variable system. Variables prefixed with `EXPO_PUBLIC_` are available in the app.

**Required:**
- `EXPO_PUBLIC_GEMINI_API_KEY`: Your Google Gemini API key

## Security Notes

- Never commit your `.env` file to version control
- The `.env` file is already in `.gitignore`
- API keys are only used client-side (Expo public variables)
- For production, consider using environment-specific configurations

## Troubleshooting

### API Key Issues

If you see warnings about missing API keys:
1. Ensure `.env` file exists in the root directory
2. Check that the variable name is exactly `EXPO_PUBLIC_GEMINI_API_KEY`
3. Restart Expo after creating/modifying `.env`
4. Verify your API key is valid at [Google AI Studio](https://aistudio.google.com/app/apikey)

### Location Permissions

The app requires location permissions for the "Date Spots" feature. Make sure to grant permissions when prompted.

## License

Private project

