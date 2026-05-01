# 🚀 QUICK START GUIDE - PROJECT 3

Follow these steps to get the application running:

---

## STEP 1: Setup Google OAuth

1. Go to https://console.cloud.google.com/
2. Create a new project or select existing
3. Navigate to **APIs & Services** > **Credentials**
4. Click **Create Credentials** > **OAuth client ID**
5. Choose **Web application**
6. Configure:
   - **Authorized JavaScript origins**: `http://localhost:5173`
   - **Authorized redirect URIs**: `http://localhost:5173/auth/google/callback`
7. Save **Client ID** and **Client Secret**

---

## STEP 2: Configure Environment Variables

Create `ai_forge_backend/.env` with:

```env
# Database
DATABASE_URL=your-supabase-postgresql-url

# JWT
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440

# Google OAuth (from Step 1)
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
FRONTEND_URL=http://localhost:5173

# LiteLLM
LITELLM_PROXY_URL=http://litellm.amzur.com:4000
LITELLM_VIRTUAL_KEY=your-key
LITELLM_USER_ID=your-user-id
LITELLM_MODEL=gemini/gemini-2.5-flash
```

---

## STEP 3: Create Database Tables

```bash
cd ai_forge_backend
python create_tables.py
```

You should see: `✅ Database tables created successfully!`

---

## STEP 4: Start Backend

```bash
cd ai_forge_backend
uvicorn app.main:app --reload
```

Backend will run on **http://localhost:8000**

---

## STEP 5: Start Frontend

Open a new terminal:

```bash
cd my-app
npm run dev
```

Frontend will run on **http://localhost:5173**

---

## STEP 6: Test the Application

### Test Registration
1. Go to http://localhost:5173/register
2. Try with `test@gmail.com` → Should show error
3. Try with `test@amzur.com` → Should succeed

### Test Google Login
1. Go to http://localhost:5173/login
2. Click "Continue with Google"
3. Login with @amzur.com Google account
4. Should redirect to chat

### Test Chat Threads
1. Click "+ New Chat"
2. Send a message → Creates thread with auto-title
3. Create another thread
4. Switch between threads → Messages load correctly
5. Delete a thread → Confirmation and deletion works

---

## 🎉 You're Done!

The application is now running with:
- ✅ Google OAuth
- ✅ @amzur.com restriction
- ✅ Thread-based chats
- ✅ Thread management

---

## 🐛 Troubleshooting

**Google login not working?**
- Check CLIENT_ID and CLIENT_SECRET in .env
- Verify redirect URI matches exactly in Google Console

**Can't login with email?**
- Make sure email ends with @amzur.com
- Check database connection

**Threads not loading?**
- Run `python create_tables.py` again
- Check backend terminal for errors

**Frontend errors?**
- Clear browser cache
- Check browser console for errors
- Verify backend is running

---

## 📚 Documentation

- **Full Setup Guide**: `PROJECT_3_SETUP.md`
- **Feature Summary**: `PROJECT_3_SUMMARY.md`
- **Environment Template**: `.env.example`

---

## 🎯 Next Steps

1. Customize the UI
2. Add more features
3. Deploy to production
4. Add rate limiting
5. Implement analytics

Enjoy your AI Chat application! 🚀
