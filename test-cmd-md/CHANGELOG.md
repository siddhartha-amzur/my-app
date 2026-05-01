# CHANGELOG - AI Forge Chat

## [3.0.0] - Project 3: Google OAuth + Chat Threads

### 🎉 Major Features Added

#### Google OAuth Integration
- Added Google OAuth 2.0 login flow
- Implemented authorization code exchange
- Integrated user info retrieval from Google
- Created OAuth callback handler
- Added "Continue with Google" button to UI

#### Email Domain Restriction
- Enforced @amzur.com domain restriction across all auth methods
- Email/password registration validates domain
- Email/password login validates domain
- Google OAuth validates domain before user creation
- Clear error messages for unauthorized domains

#### Thread-Based Chat System
- Replaced flat chat history with organized threads
- Each user can have multiple conversation threads
- Messages grouped by thread for better organization
- Thread-based message history

#### Thread Management
- Create new threads with auto-generated titles
- List all user threads
- Load messages by thread
- Delete threads (with cascade delete of messages)
- Update thread titles via API

#### Auto-Generated Thread Titles
- Titles generated from first user message
- Smart truncation to 40 characters
- Improves thread organization and navigation

#### Modern UI Improvements
- Collapsible thread sidebar
- Thread selection and highlighting
- Thread deletion with confirmation
- Google login button with logo
- Responsive layout
- Modern gradient design
- Improved message styling

### 🔧 Technical Changes

#### Backend

**New Models:**
- `Thread` - Stores conversation threads
- `Message` - Stores messages within threads

**Updated Models:**
- `User` - Added `auth_provider` field, made `password_hash` nullable

**New Services:**
- `thread_service.py` - Thread CRUD operations
- Google OAuth functions in `auth_service.py`

**New API Routes:**
- `GET /api/auth/google/login` - Initiate Google OAuth
- `GET /api/auth/google/callback` - Handle OAuth callback
- `POST /api/threads` - Create thread
- `GET /api/threads` - List threads
- `GET /api/threads/{id}` - Get thread
- `PATCH /api/threads/{id}` - Update thread
- `DELETE /api/threads/{id}` - Delete thread
- `GET /api/threads/{id}/messages` - Get thread messages

**Updated Routes:**
- `POST /api/chat` - Now accepts `thread_id`, returns `thread_id` in response

**New Configuration:**
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `FRONTEND_URL`

**Dependencies:**
- No new dependencies (httpx already included)

#### Frontend

**New API Functions:**
- `getGoogleLoginUrl()` - Get OAuth URL
- `createThread()` - Create new thread
- `getThreads()` - Get all threads
- `getThreadMessages()` - Get thread messages
- `updateThread()` - Update thread title
- `deleteThread()` - Delete thread

**Updated Functions:**
- `sendMessage()` - Now accepts `thread_id` parameter

**Updated Pages:**
- `Login.tsx` - Added Google login button and error handling
- `Register.tsx` - Added domain restriction notice
- `Chat.tsx` - Complete redesign with thread sidebar

### 📦 Files Created

#### Backend
```
app/models/thread.py
app/models/message.py
app/schemas/thread.py
app/services/thread_service.py
app/api/threads.py
```

#### Documentation
```
PROJECT_3_SETUP.md
PROJECT_3_SUMMARY.md
QUICKSTART.md
.env.example
CHANGELOG.md
```

### 📝 Files Modified

#### Backend
```
app/models/user.py
app/services/auth_service.py
app/api/auth.py
app/api/chat.py
app/core/config.py
app/main.py
create_tables.py
```

#### Frontend
```
src/lib/api.ts
src/pages/Login.tsx
src/pages/Register.tsx
src/pages/Chat.tsx
```

### 🔒 Security Enhancements

- Email domain validation at multiple layers
- Google OAuth with authorization code flow
- Consistent JWT authentication
- httpOnly cookies prevent XSS
- User verification for thread operations
- Cascade delete prevents orphaned messages

### 🎨 UI/UX Improvements

- Clean, modern interface
- Organized thread navigation
- Visual feedback for actions
- Loading states
- Error messages
- Confirmation dialogs
- Responsive design
- Smooth animations

### ⚠️ Breaking Changes

- Chat API now returns `thread_id` in response
- Old `chats` table no longer used for new messages
- Frontend completely redesigned

### 🔄 Migration Notes

- Existing users can continue logging in
- Old chat history remains in `chats` table (not migrated)
- New chats use thread-based system
- No data loss from Project 2

### 📊 Database Schema Changes

**New Tables:**
- `threads` - Conversation threads
- `messages` - Thread messages

**Updated Tables:**
- `users` - Added `auth_provider`, made `password_hash` nullable

**Legacy Tables:**
- `chats` - Preserved but not used for new messages

### 🐛 Bug Fixes

- None (new implementation)

### ⚡ Performance Improvements

- Thread-based loading more efficient than flat history
- Messages loaded only for selected thread
- Threads loaded once on login

---

## [2.0.0] - Project 2: Authentication + Database

### Features Added
- PostgreSQL integration (Supabase)
- User authentication (email/password)
- JWT tokens with httpOnly cookies
- Chat history storage
- User-specific chat history
- Login/Register pages

---

## [1.0.0] - Project 1: Basic Chatbot

### Features Added
- FastAPI backend
- React frontend
- LangChain integration
- Gemini AI responses
- Basic chat interface
- `/chat` endpoint

---

## Version History Summary

- **v3.0.0** - Google OAuth + Chat Threads (Current)
- **v2.0.0** - Authentication + Database
- **v1.0.0** - Basic Chatbot

---

## Future Versions (Planned)

### [4.0.0] - RAG + Document Upload
- Document upload
- Vector database (ChromaDB)
- RAG-based responses
- Document management

### [5.0.0] - Advanced Features
- Multi-model support
- Streaming responses
- Real-time collaboration
- Analytics dashboard

---

*For detailed setup instructions, see PROJECT_3_SETUP.md*
*For feature summary, see PROJECT_3_SUMMARY.md*
*For quick start, see QUICKSTART.md*
