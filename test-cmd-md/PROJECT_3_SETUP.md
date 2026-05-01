# PROJECT 3 SETUP GUIDE
## Google OAuth + Chat Threads

This guide will help you set up and run Project 3 with Google OAuth and thread-based chat.

---

## ✅ What's New in Project 3

### Backend Features
- ✅ Google OAuth login with @amzur.com domain restriction
- ✅ Email/password login with @amzur.com domain restriction  
- ✅ Thread-based chat system (instead of flat chat history)
- ✅ Create/update/delete threads
- ✅ Auto-generate thread titles from first message
- ✅ Load all threads and messages on login

### Frontend Features
- ✅ Google OAuth login button
- ✅ Thread sidebar with conversation list
- ✅ Create new threads
- ✅ Delete threads
- ✅ Select and load thread messages
- ✅ Domain restriction error handling

---

## 🔧 Prerequisites

1. Python 3.10+
2. Node.js 18+
3. PostgreSQL database (Supabase)
4. Google Cloud Console account

---

## 📝 Step 1: Set Up Google OAuth

### 1.1 Create Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Navigate to **APIs & Services** > **Credentials**
4. Click **Create Credentials** > **OAuth client ID**
5. Select **Web application**
6. Configure:
   - **Name**: AI Forge Chat
   - **Authorized JavaScript origins**: 
     - `http://localhost:5173`
   - **Authorized redirect URIs**:
     - `http://localhost:5173/auth/google/callback`
7. Click **Create**
8. Copy **Client ID** and **Client Secret**

---

## 📝 Step 2: Configure Backend Environment

### 2.1 Update `.env` file

Create or update `ai_forge_backend/.env`:

```env
# Database Configuration
DATABASE_URL=your-supabase-postgresql-url

# JWT Configuration
SECRET_KEY=your-super-secret-jwt-key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440

# Google OAuth Configuration (NEW!)
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
FRONTEND_URL=http://localhost:5173

# LiteLLM Configuration
LITELLM_PROXY_URL=http://litellm.amzur.com:4000
LITELLM_VIRTUAL_KEY=your-litellm-key
LITELLM_USER_ID=your-user-id
LITELLM_MODEL=gemini/gemini-2.5-flash
```

### 2.2 Update Database Tables

The new schema includes:

**users** table (updated):
- `id` - UUID
- `email` - String (unique)
- `password_hash` - String (nullable for Google users)
- `auth_provider` - String ('email' or 'google')
- `created_at` - DateTime

**threads** table (new):
- `id` - UUID
- `user_id` - UUID (FK)
- `title` - String
- `created_at` - DateTime

**messages** table (new):
- `id` - Integer
- `thread_id` - UUID (FK)
- `message` - String
- `response` - String
- `created_at` - DateTime

**Run database creation:**

```bash
cd ai_forge_backend
python create_tables.py
```

This will create the new tables without affecting existing data.

---

## 📝 Step 3: Install Dependencies

### 3.1 Backend

No new dependencies needed! httpx is already in requirements.txt.

```bash
cd ai_forge_backend
pip install -r requirements.txt
```

### 3.2 Frontend

No new dependencies needed!

```bash
cd my-app
npm install
```

---

## 📝 Step 4: Run the Application

### 4.1 Start Backend

```bash
cd ai_forge_backend
uvicorn app.main:app --reload
```

Backend runs on: http://localhost:8000

### 4.2 Start Frontend

```bash
cd my-app
npm run dev
```

Frontend runs on: http://localhost:5173

---

## 🧪 Step 5: Test the Application

### Test 1: Email/Password Registration (with domain restriction)

1. Navigate to http://localhost:5173/register
2. Try registering with non-@amzur.com email → Should show error
3. Register with @amzur.com email → Should succeed

### Test 2: Google OAuth Login

1. Navigate to http://localhost:5173/login
2. Click "Continue with Google"
3. Select Google account
4. If email is not @amzur.com → Redirected back with error
5. If email is @amzur.com → Redirected to chat

### Test 3: Thread Management

1. Login successfully
2. Click "+ New Chat" → Creates new thread
3. Send a message → Auto-generates title from first message
4. Click on different threads → Loads thread messages
5. Click "×" on thread → Deletes thread (with confirmation)

### Test 4: Chat Functionality

1. Select or create a thread
2. Send message → Gets AI response
3. Messages saved to thread
4. Refresh page → Threads and messages persist

---

## 🔍 API Endpoints

### Authentication
- `POST /api/auth/register` - Register with email/password
- `POST /api/auth/login` - Login with email/password
- `GET /api/auth/google/login` - Get Google OAuth URL
- `GET /api/auth/google/callback` - Google OAuth callback

### Threads
- `POST /api/threads` - Create new thread
- `GET /api/threads` - Get all user threads
- `GET /api/threads/{id}` - Get specific thread
- `PATCH /api/threads/{id}` - Update thread title
- `DELETE /api/threads/{id}` - Delete thread
- `GET /api/threads/{id}/messages` - Get thread messages

### Chat
- `POST /api/chat` - Send message (with optional thread_id)

---

## 🚨 Important Notes

### Email Domain Restriction

**CRITICAL**: Only @amzur.com emails are allowed!

This is enforced at:
1. Email/password registration
2. Email/password login
3. Google OAuth login

If domain validation fails, users see:
```json
{
  "error": "Only @amzur.com accounts are allowed"
}
```

### Google OAuth Flow

1. User clicks "Continue with Google"
2. Redirected to Google login
3. User authorizes
4. Google redirects to `/auth/google/callback` with code
5. Backend exchanges code for user info
6. Backend validates email domain
7. Backend creates/updates user
8. Backend issues JWT in httpOnly cookie
9. User redirected to `/chat`

### Thread Title Generation

- Auto-generated from first user message
- Trimmed to 40 characters
- Simple string truncation (no AI)

---

## 🐛 Troubleshooting

### Issue: Google login fails

**Solution**: 
- Check GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in .env
- Verify redirect URI in Google Console matches exactly
- Check FRONTEND_URL is correct

### Issue: "Only @amzur.com accounts allowed" error

**Solution**: 
- This is expected for non-@amzur.com emails
- Use @amzur.com email for testing
- Or temporarily modify ALLOWED_DOMAIN in auth_service.py

### Issue: Threads not loading

**Solution**:
- Run `python create_tables.py` to create new tables
- Check database connection
- Verify authentication cookie is set

### Issue: Messages not saving to thread

**Solution**:
- Check thread_id is being passed correctly
- Verify foreign key relationships in database
- Check backend logs for errors

---

## 📊 Database Migration from Project 2

If you have existing data from Project 2:

1. New tables (threads, messages) are created automatically
2. Old `chats` table remains unchanged
3. Users can continue using existing accounts
4. New chats will use thread-based system
5. Old chat history remains in `chats` table (not migrated)

**Optional**: Migrate old chats to threads:

```python
# Migration script (optional)
# This is just a reference - create if needed

async def migrate_chats_to_threads():
    # For each user
    #   Create a single "Chat History" thread
    #   Move all old chats to that thread as messages
    pass
```

---

## ✅ Success Checklist

- [ ] Google OAuth credentials configured
- [ ] .env file updated with all variables
- [ ] Database tables created successfully
- [ ] Backend running on port 8000
- [ ] Frontend running on port 5173
- [ ] Can register with @amzur.com email
- [ ] Can login with email/password
- [ ] Can login with Google (@amzur.com account)
- [ ] Can create new threads
- [ ] Can send messages in threads
- [ ] Can delete threads
- [ ] Thread titles auto-generated
- [ ] Messages persist after refresh

---

## 🎉 You're Done!

Your AI Forge Chat application now supports:
- ✅ Google OAuth login
- ✅ Email domain restrictions
- ✅ Thread-based conversations
- ✅ Thread management (create/delete)
- ✅ Auto-generated titles
- ✅ Persistent chat history

Enjoy your upgraded chat application! 🚀
