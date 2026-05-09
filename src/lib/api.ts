const API_BASE_URL = 'http://localhost:8000/api';
export const MAX_UPLOAD_MB = 20;

const getErrorMessage = async (response: Response, fallback: string): Promise<string> => {
  try {
    const error = await response.json();
    if (typeof error?.detail === 'string') {
      return error.detail;
    }
    if (error?.detail?.message) {
      return error.detail.message;
    }
    if (error?.message) {
      return error.message;
    }
  } catch {
    // Ignore parse failures and use fallback.
  }
  return fallback;
};

export interface ChatRequest {
  message: string;
  thread_id?: string;
  attachment_ids?: string[];
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
  attachments?: Attachment[];
}

export interface Attachment {
  id: string;
  thread_id: string;
  message_id?: number | null;
  original_filename: string;
  stored_filename?: string;
  mime_type: string;
  file_size: number;
  file_path?: string;
  created_at: string;
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
    throw new Error(await getErrorMessage(response, 'Registration failed'));
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
    throw new Error(await getErrorMessage(response, 'Login failed'));
  }
};

export const getGoogleLoginUrl = async (): Promise<string> => {
  const response = await fetch(`${API_BASE_URL}/auth/google/login`, {
    method: 'GET',
    credentials: 'include',
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail || 'Failed to get Google login URL');
  }

  const data = await response.json();
  return data.url;
};

export const logout = async (): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/auth/logout`, {
    method: 'POST',
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Logout failed');
  }
};

// Chat API
export const sendMessage = async (
  message: string,
  threadId?: string,
  attachmentIds: string[] = []
): Promise<ChatResponse> => {
  console.log('[frontend] sending chat request', {
    message,
    thread_id: threadId,
    attachment_ids: attachmentIds,
  });

  const response = await fetch(`${API_BASE_URL}/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',  // Include cookies for authentication
    body: JSON.stringify({
      message,
      thread_id: threadId,
      attachment_ids: attachmentIds,
    }),
  });

  if (!response.ok) {
    throw new Error(await getErrorMessage(response, `HTTP error! status: ${response.status}`));
  }

  return response.json();
};

export const getChatHistory = async (): Promise<ChatHistory[]> => {
  const response = await fetch(`${API_BASE_URL}/chats/`, {
    method: 'GET',
    credentials: 'include',  // Include cookies for authentication
  });

  if (!response.ok) {
    throw new Error(await getErrorMessage(response, `HTTP error! status: ${response.status}`));
  }

  return response.json();
};

export const createThread = async (title: string = 'New Chat'): Promise<Thread> => {
  const response = await fetch(`${API_BASE_URL}/threads`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({ title }),
  });

  if (!response.ok) {
    throw new Error(await getErrorMessage(response, 'Failed to create thread'));
  }

  return response.json();
};

export const getThreads = async (): Promise<Thread[]> => {
  const response = await fetch(`${API_BASE_URL}/threads`, {
    method: 'GET',
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error(await getErrorMessage(response, `HTTP error! status: ${response.status}`));
  }

  return response.json();
};

export const getThreadMessages = async (threadId: string): Promise<Message[]> => {
  const response = await fetch(`${API_BASE_URL}/threads/${threadId}/messages`, {
    method: 'GET',
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error(await getErrorMessage(response, `HTTP error! status: ${response.status}`));
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
    throw new Error(await getErrorMessage(response, 'Failed to update thread'));
  }

  return response.json();
};

export const deleteThread = async (threadId: string): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/threads/${threadId}`, {
    method: 'DELETE',
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error(await getErrorMessage(response, 'Failed to delete thread'));
  }
};

export const uploadAttachment = (
  file: File,
  threadId: string,
  onProgress?: (progress: number) => void
): Promise<Attachment> => {
  return new Promise((resolve, reject) => {
    console.log('[frontend] starting upload', {
      filename: file.name,
      size: file.size,
      type: file.type,
      thread_id: threadId,
    });

    const xhr = new XMLHttpRequest();
    const formData = new FormData();

    formData.append('thread_id', threadId);
    formData.append('file', file);

    xhr.open('POST', `${API_BASE_URL}/uploads`);
    xhr.withCredentials = true;

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable && onProgress) {
        onProgress(Math.round((event.loaded / event.total) * 100));
      }
    };

    xhr.onload = () => {
      try {
        const data = JSON.parse(xhr.responseText);
        if (xhr.status >= 200 && xhr.status < 300) {
          console.log('[frontend] upload success', data);
          resolve(data as Attachment);
          return;
        }
        console.error('[frontend] upload failed response', data);
        reject(new Error(data.detail?.message || data.detail || 'Upload failed'));
      } catch {
        reject(new Error('Upload failed'));
      }
    };

    xhr.onerror = () => {
      console.error('[frontend] upload network error');
      reject(new Error('Upload failed'));
    };
    xhr.send(formData);
  });
};

export const getAttachmentUrl = (attachmentId: string): string => {
  return `${API_BASE_URL}/uploads/${attachmentId}`;
};
