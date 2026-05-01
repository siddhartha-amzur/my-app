# 🎯 PROJECT 3 - QUICK REFERENCE CARD

## 🚦 START HERE

### Prerequisites Checklist
- [ ] Python 3.10+ installed
- [ ] Node.js 18+ installed
- [ ] PostgreSQL database (Supabase) ready
- [ ] Google OAuth credentials obtained

### Environment Variables (CRITICAL!)
```env
GOOGLE_CLIENT_ID=your-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-secret
FRONTEND_URL=http://localhost:5173
DATABASE_URL=postgresql+asyncpg://...
SECRET_KEY=your-jwt-secret
```

### Run Commands
```bash
# Backend
cd ai_forge_backend
python create_tables.py              # First time only
uvicorn app.main:app --reload        # Start server

# Frontend  
cd my-app
npm run dev                          # Start dev server
```

---

## 🔑 Google OAuth Setup

1. **Console**: https://console.cloud.google.com/
2. **Create**: APIs & Services → Credentials → OAuth client ID
3. **Configure**:
   - Type: Web application
   - Origins: `http://localhost:5173`
   - Redirect: `http://localhost:5173/auth/google/callback`
4. **Copy**: Client ID + Client Secret → `.env`

---

## 📊 Database Schema Quick View

```
users (updated)
├── id (UUID)
├── email (String)
├── password_hash (String, nullable)
├── auth_provider (String) ← NEW
└── created_at (DateTime)

threads (new)
├── id (UUID)
├── user_id (UUID) → users.id
├── title (String)
└── created_at (DateTime)

messages (new)
├── id (Integer)
├── thread_id (UUID) → threads.id
├── message (String)
├── response (String)
└── created_at (DateTime)
```

---

## 🔌 API Endpoints Quick Reference

### Auth
```
POST   /api/auth/register                 # Register
POST   /api/auth/login                    # Login
GET    /api/auth/google/login             # OAuth URL
GET    /api/auth/google/callback          # OAuth callback
```

### Threads
```
POST   /api/threads                       # Create
GET    /api/threads                       # List all
GET    /api/threads/{id}                  # Get one
PATCH  /api/threads/{id}                  # Update
DELETE /api/threads/{id}                  # Delete
GET    /api/threads/{id}/messages         # Get messages
```

### Chat
```
POST   /api/chat                          # Send message
Body: { message, thread_id? }
Response: { response, thread_id }
```

---

## 🎨 UI Navigation

```
/                  → Landing
/register          → Sign up
/login             → Login (email or Google)
/chat              → Main chat interface

Chat Interface:
├── Sidebar
│   ├── Thread list
│   ├── + New Chat
│   └── Logout
└── Main Area
    ├── Messages
    └── Input box
```

---

## ⚠️ CRITICAL RULES

### Email Domain Restriction
**ONLY @amzur.com ALLOWED**

Applied to:
- ✅ Email/password registration
- ✅ Email/password login
- ✅ Google OAuth login

Error message:
```json
{
  "error": "Only @amzur.com accounts are allowed"
}
```

### Thread Titles
- Auto-generated from first user message
- Max 40 characters
- Simple truncation with "..."

### Authentication
- JWT in httpOnly cookies
- 24-hour expiration
- No localStorage usage

---

## 🧪 Testing Scenarios

### 1. Registration
```
Input: user@gmail.com → ❌ Error
Input: user@amzur.com → ✅ Success
```

### 2. Google Login
```
Google account: john@gmail.com → ❌ Error + Redirect
Google account: john@amzur.com → ✅ Success + Chat
```

### 3. Thread Flow
```
1. Login
2. Click "+ New Chat"
3. Send message → Thread created with auto-title
4. Send more messages → Added to same thread
5. Click another thread → Loads different messages
6. Click × on thread → Confirmation → Deleted
```

---

## 🐛 Quick Troubleshooting

| Problem | Quick Fix |
|---------|-----------|
| Google login fails | Check CLIENT_ID and SECRET in .env |
| "Domain not allowed" | Expected! Use @amzur.com email |
| Threads not loading | Run `python create_tables.py` |
| Messages not saving | Check backend logs, verify DB connection |
| Frontend errors | Clear cache, check console, verify backend running |
| CORS errors | Check backend CORS settings in main.py |

---

## 📦 File Locations

### Backend Configuration
```
ai_forge_backend/
├── .env                    # Environment variables
├── create_tables.py        # Database setup
└── app/
    ├── main.py             # App entry point
    └── core/
        └── config.py       # Settings class
```

### Frontend Configuration
```
my-app/
├── vite.config.ts          # Vite config
└── src/
    ├── lib/
    │   └── api.ts          # API client
    └── pages/
        ├── Login.tsx       # Login page
        ├── Register.tsx    # Register page
        └── Chat.tsx        # Main app
```

---

## 🔄 Common Workflows

### Add New User (Email/Password)
1. User goes to `/register`
2. Enters email (must be @amzur.com)
3. Enters password (min 6 chars)
4. Submits → User created in DB
5. Redirected to `/login`
6. Logs in → JWT issued → Redirected to `/chat`

### Add New User (Google OAuth)
1. User goes to `/login`
2. Clicks "Continue with Google"
3. Redirected to Google
4. Selects account (must be @amzur.com)
5. Authorizes app
6. Redirected back with code
7. Backend exchanges code for user info
8. Backend validates domain
9. Backend creates/updates user
10. JWT issued → User in `/chat`

### Create and Use Thread
1. User in `/chat`
2. Clicks "+ New Chat"
3. New thread created (empty)
4. Sends message → Thread title auto-generated
5. AI responds → Saved to thread
6. Continue chatting in same thread
7. OR select different thread to switch

---

## 📚 Documentation Index

| Document | Purpose |
|----------|---------|
| `QUICKSTART.md` | Fast setup, 6 steps |
| `PROJECT_3_SETUP.md` | Detailed setup guide |
| `PROJECT_3_SUMMARY.md` | Feature summary and architecture |
| `CHANGELOG.md` | Version history |
| `IMPLEMENTATION_COMPLETE.md` | Full implementation details |
| `.env.example` | Environment variable template |

---

## 🎯 Key Metrics

- **New Backend Files**: 5
- **Modified Backend Files**: 8
- **Modified Frontend Files**: 4
- **API Endpoints Added**: 8
- **New Database Tables**: 2
- **Lines of Code**: ~1500+
- **Setup Time**: ~15 minutes
- **Documentation Pages**: 6

---

## ✅ Pre-Flight Checklist

Before starting:
- [ ] Google OAuth credentials ready
- [ ] Database URL ready
- [ ] `.env` file configured
- [ ] Dependencies installed (backend + frontend)
- [ ] Database tables created
- [ ] Backend running on 8000
- [ ] Frontend running on 5173

---

## 🎉 Success Indicators

You'll know it's working when:
- ✅ Google login button appears on login page
- ✅ Can register with @amzur.com email
- ✅ Cannot register with other domains
- ✅ Google login works with @amzur.com account
- ✅ Thread sidebar shows on chat page
- ✅ Can create and delete threads
- ✅ Thread titles auto-generate
- ✅ Messages persist after refresh

---

## 🆘 Emergency Commands

```bash
# Restart everything
Ctrl+C  # Stop backend
Ctrl+C  # Stop frontend
python create_tables.py  # Recreate tables
uvicorn app.main:app --reload  # Restart backend
npm run dev  # Restart frontend

# Clear browser
Ctrl+Shift+Delete  # Clear cache
# OR
Clear cookies manually

# Check logs
# Backend: Terminal running uvicorn
# Frontend: Browser console (F12)
# Database: Check Supabase dashboard
```

---

## 💡 Pro Tips

1. **Development**: Use http://localhost URLs (no HTTPS)
2. **Testing**: Use @amzur.com Gmail account for testing
3. **Debugging**: Check browser console + backend terminal
4. **Database**: Use Supabase dashboard to view tables
5. **Errors**: Most issues are environment variables or OAuth config

---

**Need help?** → Check troubleshooting in PROJECT_3_SETUP.md

**Ready to go?** → See QUICKSTART.md for step-by-step

**Want details?** → Read PROJECT_3_SUMMARY.md

---

**🚀 You're all set! Happy coding!**
