# 🌟 Aura Mental Health System

> A comprehensive, AI-powered mental health support platform designed to help users track moods, manage stress, play wellness games, and receive personalized emotional support through advanced AI.

## 📋 Table of Contents

- [Project Overview](#project-overview)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Feature Set](#feature-set)
- [Installation & Setup](#installation--setup)
- [Project Structure](#project-structure)
- [How It Works](#how-it-works)
- [API Endpoints](#api-endpoints)
- [Component Documentation](#component-documentation)

---

## 🎯 Project Overview

**Aura** is a full-stack mental health support system that combines:
- 🎮 **Gamified wellness activities** to encourage daily engagement
- 📊 **Mood tracking & analytics** with historical visualization
- 🤖 **AI-powered emotional analysis** using multi-model intelligence
- 💬 **Conversational AI support** with 24-hour summaries
- 🔑 **Crisis detection & intervention** with immediate support resources
- 🏆 **Gamification systems** (Daily Tower, Zen Streaks, Mindful Minutes)

The system helps users maintain mental wellbeing through interactive games, mood logging, and supportive AI conversations.

---

## 🏗️ Architecture

```
Aura Mental Health System
├── Frontend (React + Vite)
├── Backend Node.js (Express + MongoDB)
└── Backend Python (FastAPI + AI/ML)
```

### Technology Stack Overview:

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | React 19, Vite, Tailwind CSS | User interface & interactions |
| **Backend API** | Express.js, Node.js | REST API, user management, chat |
| **Database** | MongoDB, Mongoose | User data, moods, streaks |
| **AI Engine** | FastAPI, Python | Emotion analysis, crisis detection |
| **AI Models** | Gemini 2.5, Groq, Hugging Face | Multi-model LLM & emotion detection |
| **Authentication** | JWT | Secure session management |

---

## 🛠️ Tech Stack

### Frontend
- **React 19.2.4** - UI framework
- **Vite 8.0.4** - Fast build tool & dev server
- **Tailwind CSS 4.2** - Utility-first CSS framework
- **React Router 7.14** - Client-side routing
- **Axios 1.15** - HTTP client
- **Recharts 3.8** - Data visualization
- **Lucide React 1.8** - Icon library

### Backend (Node.js)
- **Express 5.2** - HTTP server framework
- **MongoDB + Mongoose 9.4** - NoSQL database
- **JWT (jsonwebtoken)** - Authentication
- **bcrypt** - Password hashing
- **CORS** - Cross-origin requests
- **dotenv** - Environment variables

### Backend (Python)
- **FastAPI** - Modern async web framework
- **Torch & Transformers** - AI/ML libraries
- **DistilBERT** - Emotion classification model
- **Google Generative AI (Gemini)** - Advanced LLM
- **Groq API** - Fast inference API
- **PEFT** - Parameter-efficient fine-tuning
- **Pydantic** - Data validation

---

## ✨ Feature Set

### 🎮 Wellness Games
1. **Balloon Pop** - Click balloons to release stress
2. **Zen Tile Tapping** - Meditative tile matching
3. **Mind Garden** - Grow virtual plants with mindful activities
4. **Colour Therapy** - Immersive color-based relaxation
5. **Emotion Matching** - Learn emotion recognition
6. **Burning Worries** - Cathartic worry release
7. **Let It Go** - Acceptance-based exercise
8. **Cool Down** - Breathing & grounding techniques
9. **Breathing Widget** - Guided 4-4-4-4 box breathing

### 📊 Mood Tracking
- **Daily Mood Logging** - 1-10 scale with emotional notes
- **7-Day Mood Chart** - Trending visualization
- **Monthly Progress Calendar** - Color-coded mood history
- **Weekly Zen Streak** - Consecutive check-in counter
- **Mindful Minutes Tracker** - Game completion timer
- **Statistics Dashboard** - Positive/Tough day analysis

### 🏆 Gamification
- **Daily Tower Building** - Stack colored blocks for each daily check-in
  - Rainbow color progression (Red → Purple)
  - Auto-reset on missed day
  - Milestone badges at 7, 14, 30, 100 days
  
- **Zen Streak System**
  - Tracks consecutive active days
  - Resets after 2-day gap
  - Displayed on home dashboard

### 🤖 AI Features
- **Emotion Analysis** - Keyword-based & ML-powered emotion detection
- **Multi-Model LLM** - Gemini 2.5 + Groq for diverse responses
- **24-Hour Summaries** - Auto-generated conversation summaries
- **AI Mood Classification** - Categorizes days as positive/tough/neutral
- **Crisis Detection** - Identifies harmful ideation and triggers intervention
- **Conversational Support** - Natural dialogue with emotional awareness

### 🚨 Crisis Features
- **Automated Detection** - Identifies suicidal/harmful language
- **Emergency Resources** - Help line grid with contact options
  - SMIT Counselor: Ms. Shivangee Gupta
  - Medical/Ambulance numbers
  - Tele MANAS, Vandrevala Foundation, Kiran Help
- **Breathing Support** - Immediate access to calming exercises
- **Gentle Intervention** - Non-judgmental guidance

---

## 📦 Installation & Setup

### Prerequisites
- Node.js 18+ & npm
- Python 3.10+
- MongoDB 6+
- Git

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

📌 **Note:** Frontend is in light-mode theme with cream (#FFFBF0) instead of white

### Backend Node.js Setup

```bash
cd backend-node
npm install

# Create .env file with:
MONGODB_URI=mongodb://localhost:27017/aura
JWT_SECRET=your_jwt_secret_here
PORT=5000

npm start
```

### Backend Python Setup

```bash
cd backend-python
python -m venv venv
source venv/Scripts/activate  # Windows
pip install -r requirements.txt

# Create .env file with:
GROQ_API_KEY=your_groq_key
GEMINI_API_KEY_1=your_gemini_key
GEMINI_API_KEY_2=your_backup_gemini_key
HF_TOKEN=your_huggingface_token

python -m uvicorn main:app --reload --port 8000
```

---

## 📁 Project Structure

```
Aura-Mental-Health-System/
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── dashboard.jsx      # Main dashboard with tabs
│   │   │   ├── home.jsx           # Home with mood anchor & stats
│   │   │   ├── login.jsx          # Authentication
│   │   │   ├── profile.jsx        # User profile
│   │   │   ├── sanchuary.jsx      # Game hub
│   │   │   └── warningpage.jsx    # Crisis page
│   │   ├── components/
│   │   │   ├── BalloonPop.jsx
│   │   │   ├── BreathingWidget.jsx
│   │   │   ├── BurnTheWorries.jsx
│   │   │   ├── CampfireStreak.jsx      # Daily tower (NEW)
│   │   │   ├── ColourTherapy.jsx
│   │   │   ├── CoolDown.jsx
│   │   │   ├── CrisisWarning.jsx       # Crisis intervention
│   │   │   ├── EmotionMatching.jsx
│   │   │   ├── LetItGo.jsx
│   │   │   ├── MindGarden.jsx
│   │   │   ├── MonthlyProgress.jsx     # Calendar mood tracker
│   │   │   ├── ZenTileTapping.jsx
│   │   │   └── navigation.jsx
│   │   ├── hooks/
│   │   │   └── useMindfulTracker.jsx   # Game tracking hook
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── tailwind.config.js
│
├── backend-node/
│   ├── server.js              # Express server
│   ├── models/
│   │   ├── user.js           # User schema
│   │   ├── MoodLog.js        # Mood tracking
│   │   ├── GameProgress.js   # Game stats
│   │   └── Chat.js           # Conversation history
│   ├── routes/
│   │   ├── auth.js           # Login/signup
│   │   ├── user.js           # User profile & streaks
│   │   ├── chat.js           # AI chat
│   │   ├── games.js          # Game progress
│   │   └── mood.js           # Mood logging
│   ├── .env
│   └── package.json
│
├── backend-python/
│   ├── main.py                # FastAPI app
│   ├── heuristics.py          # Safety detection
│   ├── requirements.txt
│   ├── Aura_Brain/            # ML models (excluded from git)
│   │   ├── adapter_config.json
│   │   ├── adapter_model.safetensors
│   │   └── tokenizer files...
│   └── .env
│
└── .gitignore
```

---

## 🔄 How It Works

### 1️⃣ User Authentication
1. User registers/logs in via login page
2. Node backend validates credentials & creates JWT
3. Frontend stores token in localStorage
4. All API requests include Authorization header

### 2️⃣ Mood Tracking Flow
```
User logs mood (1-10 scale)
  ↓
POST /api/mood/log
  ↓
Python /api/analyze_mood (optional)
  ↓ Keyword-based emotion detection
Stores in MongoDB with:
- moodScore (1-10)
- emotions (detected)
- valence (positive/tough/neutral)
- recordedAt (timestamp)
  ↓
Dashboard displays via /api/mood/history
```

### 3️⃣ Daily Check-In & Tower System
```
User opens "Check-in" tab
  ↓
POST /api/user/check-in auto-triggers
  ↓
Backend calculates:
- Days since lastCheckInDate
- If same day: Nothing (prevent duplicates)
- If 1-day gap: Increment streak
- If 2-day gap: Reset to 1
- If 3+ day gap: Reset to 1
  ↓
CampfireStreak component displays tower
- Each day = colored block
- Colors cycle: Red → Orange → Yellow → Green → Blue → Indigo → Purple → Pink
- Blocks stack vertically
- Auto-resets on missed day
```

### 4️⃣ AI Emotional Support
```
User sends message in Aura AI tab
  ↓
POST /api/chat with user_message
  ↓
Node routes to Python /api/chat
  ↓
Python:
1. Checks against HeuristicBrain for safety
2. If crisis detected: action="trigger_warning"
3. Otherwise: Calls LLM (Gemini or Groq)
4. Analyzes mood in message
  ↓
Returns: {response, emotion, valence, action}
  ↓
Frontend displays response + optional warning
```

### 5️⃣ Crisis Detection
```
User message contains harmful keywords:
- "suicide", "kill myself", "end it", etc.
  ↓
HeuristicBrain detects risk level
  ↓
If HIGH RISK:
  action="trigger_warning"
  ↓
CrisisWarning component shows:
- Emergency message with empathy
- Help line grid with phone links
- "Take a Calming Breath" button → BreathingWidget modal
```

### 6️⃣ Games & Mindful Minutes
```
User plays game (e.g., Balloon Pop)
  ↓
Game tracks time_played
  ↓
On game completion:
POST /api/games/progress
{
  gameId: "balloon-pop",
  timeSpent: 180,
  score: 150
}
  ↓
Updates:
- User.mindfulMinutes += timeSpent
- GameProgress record
  ↓
Homepage displays:
- Total mindful minutes
- Progress toward daily goal
- Games played this session
```

---

## 📡 API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login & get JWT

### User Management
- `GET /api/user/stats` - Get zen streak & mindful minutes
- `POST /api/user/check-in` - Register daily visit (auto-triggers)
- `GET /api/user/streak-status` - Get tower streak data
- `PUT /api/user/profile` - Update profile

### Mood Tracking
- `POST /api/mood/log` - Log mood with optional notes
- `GET /api/mood/history?limit=30` - Get 30-day mood history

### Games
- `POST /api/games/progress` - Log game completion
- `GET /api/games/progress` - Get game statistics

### Chat & AI
- `POST /api/chat` - Send message to Aura AI
- `GET /api/chat/history` - Get conversation history
- `GET /api/chat/summary` - Get 24-hour summary (auto-generated)

### Python AI Services
- `POST /api/analyze_mood` - Analyze text for emotions
- `POST /api/chat` - LLM conversation + safety check
- `POST /api/detect_crisis` - Suicide risk assessment

---

## 🎨 Component Documentation

### Core Components

#### **CampfireStreak** (NEW - Daily Tower)
- **Props**: `streakDays` (number), `isDarkMode` (bool)
- **Features**:
  - Stacking colored blocks per day
  - Rainbow progression
  - Milestone badges
  - Auto-reset on missed day
- **Styling**: Blue theme with gradient backgrounds

#### **MonthlyProgress**
- **Props**: `moodHistory` (array), `isDarkMode` (bool)
- **Features**:
  - Calendar grid with color-coded days
  - Monthly stats (avg mood, positive/tough days)
  - Month navigation
  - Automatically normalizes 1-10 scores to 1-5 scale
- **Colors**: Emerald (great) → Sky (ok) → Rose (stressed)

#### **CrisisWarning**
- **Props**: `onOpenBreathing` (callback), `isDarkMode` (bool)
- **Features**:
  - Emergency resource grid
  - Contact links (tel: protocol)
  - Calming breath button
  - Ms. Shivangee Gupta (SMIT Counselor)

#### **BreathingWidget**
- **Props**: `fullScreen` (bool), `isDarkMode` (bool), `onExit` (callback)
- **Features**:
  - 4-4-4-4 box breathing exercise
  - Animated breathing circle
  - Phase text (Inhale, Hold, Exhale)
  - Modal or fullscreen modes

#### **Games** (9 total)
- Event-based mindful minute tracking
- Score & time tracking
- Visual feedback & animations
- Integration with useMindfulTracker hook

---

## 🎨 Design System

### Color Palette
- **Light Mode**: Cream (#FFFBF0) background instead of white
- **Dark Mode**: Slate-900 and slate-800 backgrounds
- **Accent Colors**:
  - Blue (Primary UI)
  - Orange (Games)
  - Green (Positive states)
  - Red (Alert states)

### Themes
- Full dark/light mode support via `isDarkMode` prop
- CSS applied via `isDarkMode ? 'dark-class' : 'light-class'` pattern

---

## 🚀 Deployment

### Frontend
```bash
npm run build  # Creates dist/ folder
# Deploy dist/ to Vercel, Netlify, or static host
```

### Backend Node
```bash
npm start
# Deploy to Heroku, Railway, AWS, or VPS
```

### Backend Python
```bash
# Requirements: CUDA/GPU for optimal inference
uvicorn main:app --host 0.0.0.0 --port 8000
# Deploy to HuggingFace Spaces, Railways, or cloud VM
```

---

## 🔐 Security & .gitignore

The `.gitignore` protects:
- ✅ `node_modules/` - Dependencies
- ✅ `.env` - API keys & secrets
- ✅ `Aura_Brain/` folder - Large ML models (safetensors, bin, pth files)
- ✅ `__pycache__/` - Python cache
- ✅ `.pem` files - SSL certificates

**⚠️ Critical**: Never commit API keys, models, or sensitive data!

---

## 📝 Requirements Files

Three requirements files have been created:
- `backend-python/requirements.txt` - Python dependencies
- `backend-node/requirements.txt` - Node packages reference
- `frontend/requirements.txt` - NPM packages reference

Install with:
```bash
pip install -r backend-python/requirements.txt  # Python
npm install  # Node (uses package.json)
```

---

## 🤝 Contributing

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Commit changes: `git commit -m "Add feature"`
3. Push to branch: `git push origin feature/your-feature`
4. Open a pull request

---

## 📄 License

ISC License - See package.json

---

## ❓ FAQ

**Q: Why separate Python & Node backends?**  
A: Python handles AI/ML (transformers, safety detection), Node handles REST API & database operations.

**Q: How does crisis detection work?**  
A: HeuristicBrain uses keyword matching + ML-based risk scoring to identify harmful ideation.

**Q: Can I run this locally?**  
A: Yes! Ensure MongoDB is running and all .env variables are set.

**Q: Why is Aura_Brain excluded from git?**  
A: ML models are 2GB+ and exceed GitHub limits. Download separately or use HuggingFace models.

---

**Built with ❤️ for mental health support** 🌟
