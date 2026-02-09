# ❤️ RelationshipAI v2.0

**Your Personal AI Companion for Every Stage of Love.**

RelationshipAI is an intelligent relationship coaching app built with **React Native (Expo)** and powered by **Google Gemini AI**. It dynamically adapts its interface, features, and AI advice based on the user's current relationship status (Healing, Dating, or In a Relationship) to provide the most relevant companionship.

![Project Status](https://img.shields.io/badge/Status-Demo_Ready-green) ![Expo](https://img.shields.io/badge/Expo-Go-black) ![AI](https://img.shields.io/badge/Powered%20by-Gemini-orange)

---

## 🆕 What's New in v2.0

### 🔐 Phase-Based Feature Unlock System
Users progress through relationship phases, unlocking features as they grow:
- **Healing Phase** → Always accessible (starting point)
- **Dating Phase** → Unlocks after completing healing journey
- **Coaching Phase** → Unlocks after making matches

### 🧪 Demo Mode Controls
For testers and demos:
- **Demo Mode Toggle** → Instantly unlock ALL features
- **Quick Unlock Buttons** → Skip phases for testing
- **Reset Progress** → Start fresh for demos

### 📍 Location-Based Features
- **Nearby Places** → Date spots, cafes, parks with real images
- **People Nearby** → See matches near your location with distance
- **Google Maps Integration** → Get directions to recommended spots

### 🖼️ Premium UI
- **Profile Images** → High-quality photos for all profiles
- **Place Images** → Beautiful venue photography
- **Locked State UI** → Clear visual feedback for locked features

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
* **Auto-Routing**: Automatically navigates users to the most relevant home tab based on their status.
* **Theme Adaptation**: The UI color scheme changes dynamically to match the current mode.
* **Feature Locking**: Tabs show lock icons when features aren't yet unlocked.

### 4. 💕 Dating Features
* **Swipe Interface**: Tinder-style card swiping for matches
* **People Nearby**: See who's close to you with distance indicators
* **Compatibility Scores**: AI-calculated match percentages
* **Chat**: Message your matches

### 5. 🧘 Healing Features
* **Progress Dashboard**: Track your healing journey
* **Breathing Exercises**: Guided relaxation
* **Journal**: AI-analyzed mood tracking
* **Memory Reframing**: Process past photos with AI guidance
* **Healing Chat**: Compassionate AI conversation partner

### 6. ⚙️ Profile & Settings
* **Status Switcher**: Easily switch between relationship modes.
* **Location Editor**: Update your city for local recommendations.
* **Demo Controls**: Quick unlock buttons for testing.
* **Data Reset**: Wipe app data and restart.

---

## 🚀 Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Gemini API Key

1. Get your API key from [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```
3. Edit `.env` and add your key:
   ```
   EXPO_PUBLIC_GEMINI_API_KEY=your_actual_api_key_here
   ```

### 3. Run the App

```bash
# Start Expo
npx expo start

# Run on iOS
npx expo start --ios

# Run on Android
npx expo start --android

# Run on Web
npx expo start --web
```

---

## 🧪 Demo Mode

For testing all features without going through the unlock progression:

1. Open the app
2. Go to **Profile** tab
3. Scroll to **🧪 Demo Controls**
4. Toggle **Demo Mode** ON

This instantly unlocks:
- ✅ Dating features
- ✅ Coaching/Instructor features
- ✅ All nearby recommendations

---

## 🛠️ Tech Stack

| Technology | Purpose |
|------------|---------|
| **Expo** | React Native framework |
| **TypeScript** | Type-safe development |
| **Zustand** | State management |
| **React Navigation** | Tab & stack navigation |
| **Google Gemini** | AI-powered recommendations |
| **Expo Location** | GPS for nearby features |
| **react-native-maps** | Map integration |

---

## 📁 Project Structure

```
src/
├── components/
│   ├── NearbyPlaces.tsx      # 📍 Location-based place cards
│   ├── NearbyPeople.tsx      # 👥 People nearby carousel
│   ├── ProgressDashboard.tsx # 📊 Healing progress tracker
│   ├── BreathingExercise.tsx # 🧘 Guided breathing
│   ├── CarouselWidget.tsx    # 🎠 Horizontal scroll widgets
│   └── ...
├── screens/
│   ├── healing/              # 💚 Healing features
│   ├── dating/               # ❤️ Dating features (with unlock gate)
│   ├── instructor/           # 🎯 AI Coach (with unlock gate)
│   └── settings/             # ⚙️ Profile & Demo Controls
├── state/
│   └── store.ts              # 🗃️ Zustand store with unlock logic
├── services/
│   └── gemini/client.ts      # 🤖 Gemini API integration
└── types/index.ts            # 📝 TypeScript definitions
```

---

## 🔐 Security

| Item | Protection |
|------|------------|
| API Keys | Stored in `.env` (gitignored) |
| `.env.example` | Contains only placeholder values |
| Source code | No hardcoded secrets |

**Never commit your `.env` file!**

---

## 📱 Screenshots

*Coming soon*

---

## 👥 Team

- **Healing Dashboard** - Lingyi Zhao
- **Dating Features** - Ao Chen
- **AI Instructor** - Roger Chen
- **Project Overview** - Yifan Guo

---

## 📄 License

Private Project - All Rights Reserved
