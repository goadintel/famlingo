# FamLingo Platform Alignment

Cross-platform feature alignment for FamLingo Web App and WeChat Mini Program.

## Platform Overview

### Web App (Vue.js)
- **Location**: `/home/cmantra/famlingo/`
- **Framework**: Vue 3 + Vite
- **Styling**: Tailwind CSS
- **State**: Pinia stores
- **Routing**: Vue Router

### WeChat Mini Program
- **Location**: `/home/cmantra/famlingo-wechat/`
- **Framework**: WeChat Mini Program native
- **Styling**: WXSS (WeChat Style Sheets)
- **State**: Component data + localStorage
- **Navigation**: wx.navigateTo / wx.switchTab

### Shared Backend
- **Location**: `/home/cmantra/famlingo-api/`
- **Framework**: Express.js (Node.js)
- **Port**: 3001 (development)
- **APIs**: DeepSeek AI, OpenAI Whisper, Edge TTS

---

## Feature Alignment Status

### ✅ Fully Aligned Features

| Feature | Web App | WeChat | Shared Backend | Notes |
|---------|---------|--------|----------------|-------|
| **Setup Flow** | ✅ SetupView.vue | ✅ setup page | N/A | Family initialization, user creation |
| **Dashboard** | ✅ DashboardView.vue | ✅ dashboard page | N/A | Stats, leaderboard, quick actions |
| **Practice Module** | ✅ PracticeView.vue | ✅ practice page | ✅ /api/tts, /api/pronunciation | Voice practice with scoring |
| **Browse Phrases** | ✅ BrowseView.vue | ✅ browse page | N/A | Category browsing, phrase library |
| **My Phrases** | ✅ MyPhrasesView.vue | ✅ myphrases page | ✅ /api/translate | Custom phrase management |
| **Settings** | ✅ SettingsView.vue | ✅ settings page | N/A | API keys, GitHub sync, cache management |
| **Chat Module** | ✅ ChatView.vue | ✅ chat page | ✅ /api/chat, /api/family, /api/translate | AI Bot, Family Chat, Translator |
| **AI Language Tutor** | ✅ Chat > AI Bot | ✅ Chat > AI Bot | ✅ /api/chat | Conversation practice with feedback |
| **Family Group Chat** | ✅ Chat > Family | ✅ Chat > Family | ✅ /api/family/send-message, /api/family/messages/:id | Real-time sync via polling |
| **Smart Translator** | ✅ Chat > Translator | ✅ Chat > Translator | ✅ /api/translate | Instant translation with context |
| **Enhanced AI Tips** | ✅ Tips sections in ChatView | ✅ Tips sections in chat.wxml | ✅ Structured tips in /api/chat | Grammar, vocab, pronunciation, culture |
| **Text Chunking** | ✅ Click-to-play chunks | ✅ Long-press audio chunks | ✅ /api/tts | Smart sentence splitting for audio |
| **Translation Caching** | ✅ localStorage cache | ✅ localStorage cache | N/A | 30 days, 100 entries, LRU eviction |
| **TTS Caching** | ✅ localStorage cache | ✅ localStorage cache | N/A | 7 days, 50 entries |
| **Cache Management** | ✅ Settings > Cache section | ✅ Settings > Cache section | N/A | View stats, clear cache |
| **GitHub Sync** | ✅ Settings > GitHub | ⚠️ Not available | N/A | Web-only feature (file size limits on WeChat) |

---

## Platform-Specific Features

### Web App Exclusive
- **GitHub Sync**: Full GitHub integration for cross-device sync
- **File Uploads**: No file size restrictions
- **URL Navigation**: Direct URL access to specific pages
- **DevTools**: Full browser debugging capabilities

### WeChat Mini Program Exclusive
- **Native WeChat Integration**: Seamless WeChat ecosystem integration
- **QR Code Scanning**: Built-in camera access
- **WeChat Sharing**: Share to WeChat contacts/moments
- **Offline Priority**: Better offline functionality

---

## Backend API Endpoints (Shared)

All endpoints work identically for both platforms:

### Core APIs
- `POST /api/chat` - AI conversation with structured tips
- `POST /api/translate` - Translation with context
- `POST /api/tts` - Text-to-speech conversion
- `POST /api/pronunciation` - Pronunciation scoring
- `POST /api/upload-audio` - Audio file upload
- `GET /health` - Server health check

### Family Chat APIs
- `POST /api/family/send-message` - Send message to family chat
- `GET /api/family/messages/:familyId?since=timestamp` - Poll for new messages
- `DELETE /api/family/clear-messages/:familyId` - Clear family chat (admin/testing)

### User APIs
- `POST /api/user/create` - Create new user
- `GET /api/user/:userId` - Get user profile
- `PUT /api/user/:userId` - Update user profile

---

## Design Consistency

### Color Palette (Both Platforms)
- **Primary Gradient**: Purple (#9333EA) → Pink (#EC4899) → Orange (#FB923C)
- **Success**: Green (#10B981)
- **Warning**: Yellow (#FBBF24)
- **Error**: Red (#EF4444)
- **Info**: Blue (#3B82F6)
- **Neutral**: Gray (#6B7280)

### Typography (Adapted per Platform)
- **Web**: Tailwind default font stack
- **WeChat**: System fonts (optimized for Chinese)

### Bilingual UI (Both Platforms)
- English (primary) + Chinese (secondary)
- Side-by-side or stacked based on space
- Consistent icon usage

---

## Data Sync Strategy

### Local Storage Keys (Shared Convention)
```javascript
// Family & User Data
famlingo_family              // Family configuration
famlingo_current_user_id     // Current active user
famlingo_user_{userId}       // Individual user data

// Phrases & Content
famlingo_custom_phrases_{userId}  // Custom phrases
famlingo_phrase_progress_{userId} // Practice progress

// Chat & Translation
famlingo_ai_chat             // AI chat history
famlingo_translations        // Translation history

// Cache (30 days)
translation_{direction}_{text}    // Translation cache
tts_{text}                        // TTS audio cache

// Settings
famlingo_github_settings     // GitHub sync config
famlingo_deepseek_key        // DeepSeek API key
famlingo_last_sync           // Last sync timestamp
```

### Cross-Platform Sync via GitHub
- Web app can push/pull to GitHub repository
- WeChat Mini Program uses local storage only (file size limits)
- Users can manually export/import data between platforms

---

## Recent Enhancements (Aligned Across Platforms)

### 1. Smart Text Chunking with Audio Playback ✅
**Implementation**:
- Web: Click on text chunks to play audio
- WeChat: Long-press on text chunks to play audio
- Both: Visual feedback with highlighting during playback
- Backend: `/api/tts` endpoint serves both platforms

### 2. Enhanced AI Feedback with Tips ✅
**Implementation**:
- Structured JSON response from `/api/chat`
- 4 tip categories: Grammar, Vocabulary, Pronunciation, Culture
- Expandable/collapsible UI in both platforms
- Tips stored in chat history for review

### 3. Real-Time Family Chat Sync ✅
**Implementation**:
- Polling-based (3-second interval)
- Incremental sync using `since` timestamp
- In-memory storage on backend (Map structure)
- Auto-deduplication on client
- Lifecycle management (start/stop polling)

### 4. Smart Translation Caching ✅
**Implementation**:
- 30-day expiration
- 100 entry limit with LRU eviction
- Cache hit indicators ("⚡ Instant")
- Same cache logic on both platforms

### 5. AI Prompt Optimization ✅
**Impact**:
- 55% token reduction in chat prompts
- 65% token reduction in translation prompts
- Reduced API costs while maintaining quality
- Benefits both platforms equally

---

## Testing Checklist

### Cross-Platform Compatibility
- [ ] AI chat works on both platforms with same backend
- [ ] Translation cache syncs correctly on both platforms
- [ ] Family chat polling works on both platforms
- [ ] TTS audio playback works on both platforms
- [ ] Tips UI displays correctly on both platforms
- [ ] Text chunking works on both platforms
- [ ] Cache management works on both platforms

### Backend API Tests
- [ ] `/api/chat` returns structured tips
- [ ] `/api/translate` caching works correctly
- [ ] `/api/family/send-message` persists messages
- [ ] `/api/family/messages/:id` returns incremental updates
- [ ] `/api/tts` caching works correctly
- [ ] `/api/pronunciation` scoring accuracy

### UI/UX Consistency
- [ ] Colors match across platforms
- [ ] Bilingual text displays correctly
- [ ] Icons are consistent
- [ ] Animations work smoothly
- [ ] Loading states are clear
- [ ] Error messages are helpful

---

## Deployment Strategy

### Web App (Vue.js)
1. Build: `npm run build`
2. Deploy to: Netlify / Vercel / GitHub Pages
3. Environment: Set `VITE_API_URL` to production API

### WeChat Mini Program
1. Build in WeChat Developer Tools
2. Submit for review via WeChat Public Platform
3. Environment: Update `apiUrl` in `app.js`

### Backend (Express.js)
1. Currently: localhost:3001 (development)
2. Next: Alibaba Cloud (pending account verification)
3. Environment: Set DeepSeek + OpenAI API keys

---

## Future Enhancements

### Planned Features (Both Platforms)
- [ ] Voice recording for WeChat and Web
- [ ] Offline mode with IndexedDB
- [ ] Push notifications for family chat
- [ ] Achievements and badges system
- [ ] Weekly progress reports
- [ ] Spaced repetition algorithm

### Web-Specific
- [ ] Progressive Web App (PWA) support
- [ ] Desktop notifications
- [ ] Export data to CSV/Excel

### WeChat-Specific
- [ ] WeChat payment integration
- [ ] Share to WeChat moments
- [ ] QR code phrase sharing
- [ ] Mini Program subscriptions

---

## Maintenance Notes

### Code Organization
- **Web**: Single-file components (`.vue`)
- **WeChat**: Separate files (`.wxml`, `.wxss`, `.js`, `.json`)
- **Shared**: API route handlers in `/famlingo-api/routes/`

### Version Control
- Main branch: Stable releases
- Development branch: Active development
- Feature branches: New features

### Documentation
- README files in each directory
- Inline code comments
- API documentation in backend
- This alignment document

---

## Contact & Support

**Developer**: FamLingo Team
**Backend API**: http://localhost:3001 (development)
**Web App**: http://localhost:5173 (development)
**WeChat**: Use WeChat Developer Tools

---

**Last Updated**: 2025-10-15
**Status**: ✅ All major features aligned across platforms
