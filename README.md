# FamLingo (家语)

**Family Language Learning App**

全家一起学语言的应用程序

---

## 🎯 Vision

FamLingo is a family-focused language learning app designed to help Chinese families learn English and expat families learn Chinese. The app features a **bilingual UI** where every element is simultaneously in Chinese AND English, turning the entire interface into an immersive learning environment.

### Core Innovation
- **Bilingual UI as Pedagogy** - Every button, label, and message appears in both languages simultaneously
- **Family Accountability** - Up to 10 family members with shared progress and competition
- **Local-First Architecture** - No servers, no data concerns, works offline
- **China-Accessible AI** - DeepSeek integration for pronunciation and feedback
- **Monetizable** - ¥99/year family license model

---

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

---

## 📁 Project Structure

```
famlingo/
├── src/
│   ├── components/          # Reusable Vue components
│   │   ├── BilingualText.vue    # Core bilingual text component
│   │   └── BilingualButton.vue  # Core bilingual button component
│   ├── composables/         # Vue composables (hooks)
│   ├── stores/              # Pinia state management
│   ├── utils/               # Utility functions
│   ├── views/               # Page components
│   ├── App.vue              # Root component
│   ├── main.js              # App entry point
│   └── style.css            # Global styles (Tailwind)
├── public/                  # Static assets
│   └── audio/               # Audio pronunciation files
├── index.html               # HTML entry point
├── vite.config.js           # Vite configuration
├── tailwind.config.js       # Tailwind CSS configuration
├── package.json             # Dependencies and scripts
└── CLAUDE_SESSION_HISTORY.md # Project context for Claude sessions

```

---

## 🌐 Bilingual Design Pattern

Every text element in FamLingo shows both languages simultaneously:

```vue
<BilingualText en="Hello" cn="你好" />
<BilingualButton en="Start Learning" cn="开始学习" />
```

This creates:
- **Passive learning** during every interaction
- **Context reinforcement** - see words used in real situations
- **No language barriers** - accessible to all family members
- **Immersive environment** - the entire app is bilingual

---

## 🛠️ Tech Stack

- **Vue 3** - Modern reactive framework with Composition API
- **Vite** - Fast build tool and dev server
- **Pinia** - State management for multi-user data
- **TailwindCSS** - Utility-first CSS framework
- **IndexedDB** - Local storage for offline functionality
- **DeepSeek AI** - Pronunciation scoring and feedback

---

## 👨‍👩‍👧‍👦 Key Features

### Multi-User System
- Up to 10 users per family
- Individual progress tracking
- Separate learning directions (CN→EN or EN→CN)
- No authentication needed (trust-based family context)

### Bidirectional Learning
- **Chinese → English** (Recognition practice)
- **English → Chinese** (Production practice)
- Toggle between modes anytime
- Track accuracy separately for each direction

### Family Dashboard
- Daily leaderboard
- Streak tracking
- Family goals and achievements
- Friendly competition features

### AI Integration
- Pronunciation scoring via DeepSeek
- Translation verification
- Context-aware practice sentences
- AI study buddy chat interface

---

## 💰 Business Model

**¥99/year family license** (≈ $14 USD)

- Impulse buy threshold (less than dinner for 2)
- Family value proposition (¥10/person for 10 users)
- Competitive vs Duolingo Plus (¥88/year per person)
- Sustainable with DeepSeek AI costs

### Target Market
- Chinese families learning English (primary)
- Expat families learning Chinese (secondary)
- International schools (bulk licenses)

### Distribution
1. **WeChat Mini Program** (Priority #1)
2. **Web App / PWA** (Priority #2)
3. **App Stores** (Priority #3)

---

## 📈 Development Roadmap

### Week 1: Core Infrastructure ⬅️ Current
- [x] Project setup (Vue 3 + Vite + Pinia + TailwindCSS)
- [x] Bilingual component library
- [ ] Multi-user data model
- [ ] IndexedDB wrapper
- [ ] GitHub sync integration

### Week 2: Learning Engine
- [ ] Phrase library (500+ phrases)
- [ ] Spaced repetition algorithm
- [ ] Bidirectional mode toggle
- [ ] Practice session flow
- [ ] Progress tracking

### Week 3: Family Features & AI
- [ ] Family dashboard & leaderboard
- [ ] Achievement system
- [ ] DeepSeek API integration
- [ ] AI study buddy

### Week 4: Polish & Launch
- [ ] Mobile optimization
- [ ] Bilingual UI audit
- [ ] Onboarding flow
- [ ] Beta testing with families

---

## 🎨 Design Principles

- **Bilingual by default** - Every text element shows both languages
- **Local-first** - All data stored locally, sync is enhancement
- **Offline-capable** - Full functionality without internet
- **Fast & lightweight** - Target <1MB initial bundle
- **Mobile-first** - Optimized for foldable phones
- **Zero backend** - Static site deployment

---

## 📚 Documentation

See [CLAUDE_SESSION_HISTORY.md](./CLAUDE_SESSION_HISTORY.md) for:
- Full project context and vision
- Technical architecture details
- Business strategy and monetization
- Development decisions and rationale

---

## 🚀 Let's Be the 0.1%!

FamLingo isn't just another language app - it's a family experience that makes language learning natural, fun, and profitable. Built specifically for the China market with real families in mind.

**Building the 0.1% that actually wins in China!**
打造在中国市场成功的0.1%！

---

**Version:** 0.1.0
**Last Updated:** 2025-10-12
