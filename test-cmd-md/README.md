# AI Forge Chatbot - PROJECT 1

A simple AI chat application with a React TypeScript frontend and FastAPI backend, powered by Google's Gemini via LangChain.

## 📁 Project Structure

```
/project-root
│
├── ai_forge_backend/          # Backend (FastAPI + LangChain + Gemini)
│   ├── app/
│   │   ├── main.py           # FastAPI entry point
│   │   ├── api/
│   │   │   └── chat.py       # /chat route
│   │   ├── services/
│   │   │   └── chatbot.py    # Gemini + LangChain logic
│   │   └── core/
│   │       └── config.py     # Environment config loader
│   ├── requirements.txt      # Python dependencies
│   └── .env.example          # Environment variables template
│
├── my-app/                   # Frontend (React + TypeScript + Vite)
│   ├── src/
│   │   ├── App.tsx           # Main UI
│   │   ├── components/
│   │   │   └── ChatBox.tsx   # Chat UI component
│   │   └── lib/
│   │       └── api.ts        # API calls
│   ├── index.html
│   ├── package.json
│   └── vite.config.ts
│
└── README.md                 # This file
```

## 🚀 Features

- **Simple Chat Interface**: Clean, modern UI with real-time messaging
- **AI-Powered Responses**: Uses Google's Gemini 1.5 Flash model via LangChain
- **Fast & Lightweight**: FastAPI backend with Vite-powered React frontend
- **TypeScript**: Fully typed frontend for better developer experience
- **No Authentication**: Minimal setup for quick testing and development

## 📋 Prerequisites

- **Python 3.9+** (for backend)
- **Node.js 16+** (for frontend)
- **Google Gemini API Key** - Get one from: https://makersuite.google.com/app/apikey

## 🛠️ Setup Instructions

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd ai_forge_backend
   ```

2. **Create a virtual environment:**
   ```bash
   python -m venv venv
   ```

3. **Activate virtual environment:**
   - **Windows:**
     ```bash
     venv\Scripts\activate
     ```
   - **Mac/Linux:**
     ```bash
     source venv/bin/activate
     ```

4. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

5. **Set up environment variables:**
   ```bash
   # Copy the example env file
   cp .env.example .env
   
   # Edit .env and add your Gemini API key
   # GEMINI_API_KEY=your_actual_api_key_here
   ```

6. **Run the backend server:**
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```

   The backend will be available at: **http://localhost:8000**
   - API docs: http://localhost:8000/docs
   - Health check: http://localhost:8000/health

### Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd my-app
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Run the development server:**
   ```bash
   npm run dev
   ```

   The frontend will be available at: **http://localhost:5173**

## 🎯 Usage

1. Make sure both backend (port 8000) and frontend (port 5173) are running
2. Open your browser to http://localhost:5173
3. Type a message in the input box and click "Send"
4. Watch the AI respond!

## 🔌 API Endpoints

### POST /api/chat
Send a message to the chatbot and receive an AI response.

**Request:**
```json
{
  "message": "Hello, how are you?"
}
```

**Response:**
```json
{
  "response": "Hello! I'm doing well, thank you for asking. How can I help you today?"
}
```

## 🧪 Testing the API

You can test the API directly using curl:

```bash
curl -X POST http://localhost:8000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "What is the capital of France?"}'
```

Or visit the interactive API docs at http://localhost:8000/docs

## 📦 Tech Stack

### Backend
- **FastAPI** - Modern, fast web framework
- **LangChain** - LLM framework for building AI applications
- **Google Gemini** - State-of-the-art LLM
- **Pydantic** - Data validation and settings management
- **Uvicorn** - ASGI server

### Frontend
- **React 19** - UI library
- **TypeScript** - Type-safe JavaScript
- **Vite** - Fast build tool and dev server
- **CSS3** - Custom styling with animations

## 🔧 Project Configuration

### Backend Environment Variables
Create a `.env` file in the `ai_forge_backend` directory:
```env
GEMINI_API_KEY=your_gemini_api_key_here
```

### Frontend API Configuration
The API base URL is configured in `src/lib/api.ts`:
```typescript
const API_BASE_URL = 'http://localhost:8000/api';
```

## 🐛 Troubleshooting

### Backend Issues

**"ModuleNotFoundError"**
- Make sure you activated the virtual environment
- Run `pip install -r requirements.txt` again

**"GEMINI_API_KEY not found"**
- Check that you created the `.env` file in `ai_forge_backend/`
- Verify your API key is correctly set

**Port 8000 already in use**
- Change the port: `uvicorn app.main:app --reload --port 8001`
- Update the frontend API URL in `src/lib/api.ts`

### Frontend Issues

**"npm install" fails**
- Try deleting `node_modules` and `package-lock.json`, then run `npm install` again
- Make sure you're using Node.js 16+

**CORS errors**
- Make sure the backend is running on port 8000
- Check that CORS middleware is properly configured in `app/main.py`

**TypeScript errors**
- Run `npm install` to ensure all type definitions are installed
- Check that `tsconfig.json` exists in the `my-app` directory

## 📝 Development Notes

### What's NOT included (by design):
- ❌ User authentication
- ❌ Database integration
- ❌ Conversation history persistence
- ❌ Thread management
- ❌ LiteLLM proxy integration

These will be added in future iterations. This is **PROJECT 1** - a minimal working chatbot.

### Code Organization

**Backend:**
- `main.py` - FastAPI app initialization and routing
- `api/chat.py` - Chat endpoint logic
- `services/chatbot.py` - LangChain + Gemini integration
- `core/config.py` - Configuration and environment variables

**Frontend:**
- `App.tsx` - Main application component
- `components/ChatBox.tsx` - Chat UI with state management
- `lib/api.ts` - API communication layer

## 🚀 Next Steps

Once you have this working, you can extend it with:
- Message history storage (database)
- User authentication
- Conversation threads
- Multiple chat models
- RAG (Retrieval-Augmented Generation)
- LiteLLM proxy integration

## 📄 License

This is a learning project - feel free to use and modify as needed!

## 🤝 Contributing

This is a personal learning project, but suggestions are welcome!

---

**Built with ❤️ for learning AI application development**
