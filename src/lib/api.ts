const API_BASE_URL = 'http://localhost:8000/api';

export interface ChatRequest {
  message: string;
  thread_id?: string;
}

export interface ChatResponse {
  response: string;
  thread_id: string;
}

export interface RegisterData {
  email: string;
  password: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface UserResponse {
  id: string;
  email: string;
  created_at: string;
}

export interface ChatHistory {
  id: number;
  user_id: string;
  message: string;
  response: string;
  created_at: string;
}

export interface Thread {
  id: string;
  user_id: string;
  title: string;
  created_at: string;
}

export interface Message {
  id: number;
  thread_id: string;
  message: string;
  response: string;
  created_at: string;
}

export interface ThreadCreate {
  title?: string;
}

export interface ThreadUpdate {
  title: string;
}

// Auth API
export const register = async (data: RegisterData): Promise<UserResponse> => {
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Registration failed');
  }

  return response.json();
};

export const login = async (data: LoginData): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Login failed');
  }
};

// Google OAuth
export const getGoogleLoginUrl = async (): Promise<string> => {
  const response = await fetch(`${API_BASE_URL}/auth/google/login`, {
    method: 'GET',
  });

  if (!response.ok) {
    throw new Error('Failed to get Google login URL');
  }

  const data = await response.json();
  return data.url;
};

// Chat API (Updated for threads)
export const sendMessage = async (message: string, threadId?: string): Promise<ChatResponse> => {
  const response = await fetch(`${API_BASE_URL}/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',  // Include cookies for authentication
    body: JSON.stringify({ 
      message,
      thread_id: threadId 
    }),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
};

export const getChatHistory = async (): Promise<ChatHistory[]> => {
  const response = await fetch(`${API_BASE_URL}/chats/`, {
    method: 'GET',
    credentials: 'include',  // Include cookies for authentication
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
};

// Thread API
export const createThread = async (title: string = "New Chat"): Promise<Thread> => {
  const response = await fetch(`${API_BASE_URL}/threads`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({ title }),
  });

  if (!response.ok) {
    throw new Error('Failed to create thread');
  }

  return response.json();
};

export const getThreads = async (): Promise<Thread[]> => {
  const response = await fetch(`${API_BASE_URL}/threads`, {
    method: 'GET',
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Failed to fetch threads');
  }

  return response.json();
};

export const getThreadMessages = async (threadId: string): Promise<Message[]> => {
  const response = await fetch(`${API_BASE_URL}/threads/${threadId}/messages`, {
    method: 'GET',
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Failed to fetch messages');
  }

  return response.json();
};

export const updateThread = async (threadId: string, title: string): Promise<Thread> => {
  const response = await fetch(`${API_BASE_URL}/threads/${threadId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({ title }),
  });

  if (!response.ok) {
    throw new Error('Failed to update thread');
  }

  return response.json();
};

export const deleteThread = async (threadId: string): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/threads/${threadId}`, {
    method: 'DELETE',
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Failed to delete thread');
  }
};
