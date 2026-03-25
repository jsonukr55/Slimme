# Slimmy — Release Notes

## v1.0.0 — Initial Release
**March 25, 2026**

### What is Slimmy?
Slimmy is a personal fitness tracker designed to help you monitor your nutrition, workouts, weight, and health goals — all in one place. It features a unique **Hunter Mode** inspired by Solo Leveling, turning your fitness journey into a leveling-up experience.

---

### Features

#### 🍽️ Food & Nutrition
- Log meals across Breakfast, Lunch, Dinner, and Snacks
- Smart food search from a built-in database + your personal custom food list
- **AI Food Analyzer** powered by Groq (Llama 3.1) — analyze any dish by name or description
- Daily macro tracking: Calories, Protein, Carbs, Fat, Fiber
- Meal category auto-suggested based on time of day
- Custom foods saved to your account and shown in suggestions

#### 🏋️ Exercise & Workouts
- Log workouts with multiple exercises, sets, reps, and weight
- **Exercise Library** with 40+ exercises organized by muscle group
- Tap any exercise in the library to pre-fill the workout form
- Edit and delete logged workouts
- Calories burned estimation based on MET values and body weight
- Weekly workout stats

#### ⚖️ Weight Tracking
- Log daily weight entries
- View weight history and progress chart
- Track total weight lost from starting weight
- Accessible from the Profile section

#### 🏆 Achievements
- 15 achievements across Food, Exercise, Weight, and General categories
- **Auto-unlocks** based on real activity — no manual claiming
  - Food logging streaks (3, 7, 30 days)
  - Workout milestones (1, 10, 50, 100 workouts)
  - Weight loss milestones (2kg, 5kg, 10kg)
  - Protein and calorie goal streaks
  - Profile setup and goal setting

#### ⚔️ Hunter Mode
- Solo Leveling-inspired progression system
- Ranks: E → D → C → B → A → S → National
- Daily and weekly quests auto-tracked from your actual fitness data
  - Workouts completed, meals logged, calories burned, protein goals
- Custom quest creation
- Trophy system with star ratings
- XP rewards and stat boosts (STR, AGI, VIT, INT, SEN)

#### 👤 Profile
- Google Sign-In authentication
- Profile photo (Google or custom upload)
- TDEE calculator based on age, height, sex, and activity level
- Fitness goals (calories, protein, carbs, fat, fiber, weekly workouts)
- Samsung Health Sync via Health Connect

#### 📱 App
- Clean dark-friendly UI with 4-tab navigation
- Profile accessible from top-right avatar on every screen
- Date selector to browse historical logs
- Dashboard with daily summary ring, macros, quick actions

---

### Technical
- Built with React Native (Expo SDK 54, bare workflow)
- Expo Router for file-based navigation
- Firebase Firestore for cloud data sync
- AsyncStorage for Hunter Mode local state
- Groq API (llama-3.1-8b-instant) for AI food analysis

---

### Known Limitations
- Steps tracking requires Samsung Health sync (manual sync, not real-time)
- Water intake and sleep tracking are manual in Hunter Mode quests
- AI food analysis requires internet connection

---

### Build Info
- Package: `com.anonymous.slimmy`
- Version: `1.0.0` (versionCode 1)
- Min SDK: Android 6.0 (API 23)
- Target SDK: Android 14 (API 34)
- Signed with: `slimmy-release.jks`
