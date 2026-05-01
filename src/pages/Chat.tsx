import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  sendMessage, 
  getThreads, 
  getThreadMessages, 
  createThread, 
  deleteThread, 
  Thread, 
  Message 
} from '../lib/api';
import '../App.css';

interface ChatMessage {
  id: number;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

export default function Chat() {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingThreads, setIsLoadingThreads] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load threads on mount
  useEffect(() => {
    loadThreads();
  }, []);

  const loadThreads = async () => {
    try {
      const fetchedThreads = await getThreads();
      setThreads(fetchedThreads);
      
      // Select first thread if available
      if (fetchedThreads.length > 0 && !selectedThreadId) {
        selectThread(fetchedThreads[0].id);
      }
    } catch (error) {
      console.error('Error loading threads:', error);
    } finally {
      setIsLoadingThreads(false);
    }
  };

  const selectThread = async (threadId: string) => {
    setSelectedThreadId(threadId);
    try {
      const threadMessages = await getThreadMessages(threadId);
      const formattedMessages: ChatMessage[] = [];

      threadMessages.forEach((msg: Message, index: number) => {
        // Add user message
        formattedMessages.push({
          id: index * 2,
          text: msg.message,
          isUser: true,
          timestamp: new Date(msg.created_at),
        });
        // Add AI response
        formattedMessages.push({
          id: index * 2 + 1,
          text: msg.response,
          isUser: false,
          timestamp: new Date(msg.created_at),
        });
      });

      setMessages(formattedMessages);
    } catch (error) {
      console.error('Error loading thread messages:', error);
    }
  };

  const handleNewChat = async () => {
    try {
      const newThread = await createThread("New Chat");
      setThreads([newThread, ...threads]);
      setSelectedThreadId(newThread.id);
      setMessages([]);
    } catch (error) {
      console.error('Error creating thread:', error);
    }
  };

  const handleDeleteThread = async (threadId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!confirm('Delete this conversation?')) return;

    try {
      await deleteThread(threadId);
      const updatedThreads = threads.filter(t => t.id !== threadId);
      setThreads(updatedThreads);
      
      if (selectedThreadId === threadId) {
        if (updatedThreads.length > 0) {
          selectThread(updatedThreads[0].id);
        } else {
          setSelectedThreadId(null);
          setMessages([]);
        }
      }
    } catch (error) {
      console.error('Error deleting thread:', error);
    }
  };

  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now(),
      text: inputValue,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const messageText = inputValue;
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await sendMessage(messageText, selectedThreadId || undefined);
      
      const aiMessage: ChatMessage = {
        id: Date.now() + 1,
        text: response.response,
        isUser: false,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiMessage]);
      
      // If this was a new thread, update the thread list
      if (!selectedThreadId || selectedThreadId !== response.thread_id) {
        setSelectedThreadId(response.thread_id);
        await loadThreads();
      }
    } catch (error) {
      console.error('Error sending message:', error);
      
      const errorMessage: ChatMessage = {
        id: Date.now() + 1,
        text: 'Sorry, I encountered an error. Please try again.',
        isUser: false,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleLogout = () => {
    document.cookie = 'access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    navigate('/login');
  };

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      {/* Sidebar */}
      <div style={{
        width: isSidebarOpen ? '280px' : '0',
        background: '#2c3e50',
        color: 'white',
        transition: 'width 0.3s',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <div style={{ padding: '20px', borderBottom: '1px solid #34495e' }}>
          <h2 style={{ margin: 0, fontSize: '20px' }}>AI Chat</h2>
        </div>

        <button
          onClick={handleNewChat}
          style={{
            margin: '16px',
            padding: '12px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: 600
          }}
        >
          + New Chat
        </button>

        <div style={{ flex: 1, overflowY: 'auto', padding: '0 8px' }}>
          {isLoadingThreads ? (
            <p style={{ textAlign: 'center', color: '#95a5a6', padding: '20px' }}>
              Loading...
            </p>
          ) : threads.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#95a5a6', padding: '20px', fontSize: '14px' }}>
              No conversations yet
            </p>
          ) : (
            threads.map(thread => (
              <div
                key={thread.id}
                onClick={() => selectThread(thread.id)}
                style={{
                  padding: '12px',
                  margin: '4px 0',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  background: selectedThreadId === thread.id ? '#34495e' : 'transparent',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  transition: 'background 0.2s'
                }}
              >
                <span style={{ 
                  flex: 1, 
                  overflow: 'hidden', 
                  textOverflow: 'ellipsis', 
                  whiteSpace: 'nowrap',
                  fontSize: '14px'
                }}>
                  {thread.title}
                </span>
                <button
                  onClick={(e) => handleDeleteThread(thread.id, e)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#e74c3c',
                    cursor: 'pointer',
                    padding: '4px 8px',
                    fontSize: '16px'
                  }}
                  title="Delete thread"
                >
                  ×
                </button>
              </div>
            ))
          )}
        </div>

        <div style={{ padding: '16px', borderTop: '1px solid #34495e' }}>
          <button
            onClick={handleLogout}
            style={{
              width: '100%',
              padding: '10px',
              background: '#e74c3c',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 600
            }}
          >
            Logout
          </button>
        </div>
      </div>

      {/* Main Chat Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <div style={{
          padding: '20px',
          borderBottom: '1px solid #e0e0e0',
          background: 'white',
          display: 'flex',
          alignItems: 'center',
          gap: '16px'
        }}>
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              padding: '4px 8px'
            }}
          >
            ☰
          </button>
          <div>
            <h2 style={{ margin: 0 }}>AI Chat Assistant</h2>
            <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>Powered by Gemini</p>
          </div>
        </div>

        {/* Messages */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '20px',
          background: '#f5f5f5'
        }}>
          {messages.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: '#999' }}>
              <p style={{ fontSize: '32px', margin: '0 0 16px' }}>👋</p>
              <p>Hello! Start a new conversation.</p>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                style={{
                  display: 'flex',
                  justifyContent: message.isUser ? 'flex-end' : 'flex-start',
                  marginBottom: '16px'
                }}
              >
                <div style={{
                  maxWidth: '70%',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  background: message.isUser 
                    ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' 
                    : 'white',
                  color: message.isUser ? 'white' : '#333',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}>
                  <p style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{message.text}</p>
                  <span style={{ 
                    fontSize: '11px', 
                    opacity: 0.7, 
                    marginTop: '4px', 
                    display: 'block' 
                  }}>
                    {message.timestamp.toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              </div>
            ))
          )}
          {isLoading && (
            <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: '16px' }}>
              <div style={{
                padding: '12px 16px',
                borderRadius: '12px',
                background: 'white',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <span style={{ 
                    width: '8px', 
                    height: '8px', 
                    borderRadius: '50%', 
                    background: '#999',
                    animation: 'pulse 1.4s infinite'
                  }}></span>
                  <span style={{ 
                    width: '8px', 
                    height: '8px', 
                    borderRadius: '50%', 
                    background: '#999',
                    animation: 'pulse 1.4s infinite 0.2s'
                  }}></span>
                  <span style={{ 
                    width: '8px', 
                    height: '8px', 
                    borderRadius: '50%', 
                    background: '#999',
                    animation: 'pulse 1.4s infinite 0.4s'
                  }}></span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div style={{
          padding: '20px',
          borderTop: '1px solid #e0e0e0',
          background: 'white'
        }}>
          <div style={{ display: 'flex', gap: '12px', maxWidth: '1000px', margin: '0 auto' }}>
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              disabled={isLoading}
              style={{
                flex: 1,
                padding: '14px 16px',
                borderRadius: '12px',
                border: '1px solid #ddd',
                fontSize: '14px',
                outline: 'none'
              }}
            />
            <button
              onClick={handleSend}
              disabled={isLoading || !inputValue.trim()}
              style={{
                padding: '14px 32px',
                background: isLoading || !inputValue.trim() 
                  ? '#ccc' 
                  : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                cursor: isLoading || !inputValue.trim() ? 'not-allowed' : 'pointer',
                fontWeight: 600
              }}
            >
              {isLoading ? '...' : 'Send'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
