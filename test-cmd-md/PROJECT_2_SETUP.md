# PROJECT 2 SETUP GUIDE

## ✅ Changes Made

### Backend Changes
1. **Database Models**: Created User and Chat models
2. **Authentication**: Email/password login with JWT tokens
3. **New API Endpoints**:
   - `POST /api/auth/register` - Register new user
   - `POST /api/auth/login` - Login and get JWT token
   - `GET /api/chats/` - Get user's chat history
   - `POST /api/chat` - Now requires authentication and saves to DB
4. **New Dependencies**: SQLAlchemy, AsyncPG, Alembic, Python-Jose, Passlib

### Frontend Changes
1. **New Pages**: Login, Register, Chat
2. **Routing**: React Router for navigation
3. **Chat History**: Automatically loads on login
4. **API Updates**: All requests include credentials (cookies)

---

## 🚀 SETUP INSTRUCTIONS

### Step 1: Backend Database Configuration

1. **Get your Supabase connection string**:
   - Go to your Supabase project
   - Settings → Database → Connection string
   - Copy the connection string (URI mode)

2. **Update `.env` file** in `ai_forge_backend/`:
   ```env
   # Replace with your actual Supabase PostgreSQL connection string
   DATABASE_URL=postgresql+asyncpg://postgres.xxxx:password@aws-0-us-east-1.pooler.supabase.com:6543/postgres

   # Generate a secure secret key (run this in terminal):
   # openssl rand -hex 32
   SECRET_KEY=your-generated-secret-key-here

   # Keep existing LiteLLM settings
   LITELLM_PROXY_URL=http://litellm.amzur.com:4000
   LITELLM_VIRTUAL_KEY=sk-YLmZIK6subdXeSdRWnyCXg
   LITELLM_USER_ID=siddhartha.esunuri@amzur.com
   LITELLM_MODEL=gemini/gemini-2.5-flash
   ```

### Step 2: Create Database Tables

Run this command from `ai_forge_backend/` directory:

```bash
# Activate virtual environment
.\venv\Scripts\Activate.ps1

# Create database tables
python create_tables.py
```

You should see: "✅ Database tables created successfully!"

### Step 3: Install Frontend Dependencies

```bash
cd my-app
npm install
```

This will install `react-router-dom` for routing.

### Step 4: Start the Servers

**Terminal 1 - Backend:**
```bash
cd ai_forge_backend
.\venv\Scripts\Activate.ps1
uvicorn app.main:app --reload --port 8000
```

**Terminal 2 - Frontend:**
```bash
cd my-app
npm run dev
```

---

## 🎯 HOW TO USE

1. **Open browser**: http://localhost:5173
2. **Register**: Create a new account with email/password
3. **Login**: Use your credentials to login
4. **Chat**: Start chatting! All messages are saved to the database
5. **Logout & Login**: Login again to see your chat history

---

## 🔍 TESTING

### 1. Test Registration
```bash
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

### 2. Test Login
```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}' \
  -c cookies.txt
```

### 3. Test Chat (with authentication)
```bash
curl -X POST http://localhost:8000/api/chat \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{"message":"Hello AI!"}'
```

### 4. Test Chat History
```bash
curl http://localhost:8000/api/chats/ -b cookies.txt
```

---

## 📁 NEW FILES STRUCTURE

```
ai_forge_backend/
├── app/
│   ├── api/
│   │   ├── auth.py           # NEW: Login/Register routes
│   │   ├── chats.py          # NEW: Chat history routes
│   │   └── chat.py           # UPDATED: Now requires auth
│   ├── core/
│   │   ├── config.py         # UPDATED: Added DB & JWT settings
│   │   └── deps.py           # NEW: Authentication dependency
│   ├── db/
│   │   ├── base.py           # NEW: SQLAlchemy base
│   │   └── session.py        # NEW: Database session
│   ├── models/
│   │   ├── user.py           # NEW: User model
│   │   └── chat.py           # NEW: Chat model
│   ├── schemas/
│   │   ├── auth.py           # NEW: Auth schemas
│   │   └── chat.py           # NEW: Chat schemas
│   └── services/
│       ├── auth_service.py   # NEW: Auth logic
│       └── chat_service.py   # NEW: Chat DB operations
├── create_tables.py          # NEW: Database setup script
└── requirements.txt          # UPDATED: New dependencies

my-app/src/
├── pages/
│   ├── Login.tsx             # NEW: Login page
│   ├── Register.tsx          # NEW: Register page
│   └── Chat.tsx              # NEW: Chat page wrapper
├── components/
│   └── ChatBox.tsx           # UPDATED: Loads chat history
├── lib/
│   └── api.ts                # UPDATED: Auth & history API calls
└── App.tsx                   # UPDATED: React Router setup
```

---

## 🔧 TROUBLESHOOTING

### Database Connection Error
- Check your DATABASE_URL in `.env`
- Ensure Supabase project is active
- Verify connection string format

### Authentication Not Working
- Clear browser cookies
- Check SECRET_KEY is set in `.env`
- Restart backend server after changing `.env`

### Chat History Not Loading
- Check browser console for errors
- Verify you're logged in (check cookies)
- Check backend logs for database errors

---

## 🎉 SUCCESS CRITERIA

✅ User can register a new account
✅ User can login with credentials
✅ User can send messages (requires authentication)
✅ Messages are saved to database
✅ Chat history loads on login
✅ Previous chat history persists across sessions

---

## 📝 NOTES

- **No Google OAuth yet** - Using simple email/password
- **No threads** - All messages in single conversation
- **HttpOnly cookies** - JWT stored securely
- **Database is persistent** - All chats saved forever
- **Simple implementation** - Easy to understand and extend

---

## 🚀 NEXT STEPS (Future)

- Add Google OAuth
- Implement multiple chat threads
- Add message editing/deletion
- Add user profile settings
- Implement real-time updates with WebSockets
