const API_BASE_URL = 'http://localhost:8000/api';

export interface ChatRequest {
  message: string;
}

export interface ChatResponse {
  response: string;
}

export const sendMessage = async (message: string): Promise<string> => {
  const response = await fetch(`${API_BASE_URL}/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ message }),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data: ChatResponse = await response.json();
  return data.response;
};
