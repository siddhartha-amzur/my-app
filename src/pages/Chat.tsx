import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AttachmentPreview, { type PendingAttachment } from '../components/AttachmentPreview';
import AttachmentStatusBanner from '../components/AttachmentStatusBanner';
import AttachmentUploader from '../components/AttachmentUploader';
import ChatMessage from '../components/ChatMessage';
import DocumentUploader from '../components/DocumentUploader';
import UploadedDocuments from '../components/UploadedDocuments';
import {
  createThread,
  deleteThread,
  generateImage,
  listDocuments,
  getThreadMessages,
  getThreads,
  logout,
  MAX_UPLOAD_MB,
  sendMessage,
  updateThread,
  uploadAttachment,
  type Document,
  type Message,
  type Thread,
} from '../lib/api';

const SUPPORTED_FILE_EXTENSIONS = new Set([
  'png',
  'jpg',
  'jpeg',
  'webp',
  'mp4',
  'mov',
  'pdf',
  'txt',
  'py',
  'js',
  'ts',
  'json',
  'html',
  'css',
  'csv',
  'xlsx',
]);

/** Simple client-side image generation intent detection (mirrors backend logic). */
function isImagePrompt(text: string): boolean {
  return /^\s*(generate|create|draw|make|paint|design|render|produce|show me|give me)\b/i.test(text);
}

export default function Chat() {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [currentThreadId, setCurrentThreadId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [loadingThreads, setLoadingThreads] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [generatingImage, setGeneratingImage] = useState(false);
  const [savingTitle, setSavingTitle] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [error, setError] = useState('');
  const [editingThreadId, setEditingThreadId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [pendingAttachments, setPendingAttachments] = useState<PendingAttachment[]>([]);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'info') => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast({ message, type });
    toastTimerRef.current = setTimeout(() => setToast(null), 3500);
  };
  const navigate = useNavigate();
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, sending]);

  useEffect(() => {
    return () => {
      pendingAttachments.forEach((item) => {
        if (item.previewUrl) {
          URL.revokeObjectURL(item.previewUrl);
        }
      });
    };
  }, [pendingAttachments]);

  const selectedThreadTitle = useMemo(() => {
    return threads.find((thread) => thread.id === currentThreadId)?.title ?? 'New Chat';
  }, [threads, currentThreadId]);

  const uploadedAttachmentIds = useMemo(
    () => pendingAttachments.filter((item) => item.status === 'uploaded' && item.uploadedAttachment).map((item) => item.uploadedAttachment!.id),
    [pendingAttachments]
  );

  const hasUploadingAttachments = useMemo(
    () => pendingAttachments.some((item) => item.status === 'uploading'),
    [pendingAttachments]
  );

  const loadThreads = async (preferredThreadId?: string) => {
    const data = await getThreads();
    setThreads(data);

    if (preferredThreadId && data.some((thread) => thread.id === preferredThreadId)) {
      setCurrentThreadId(preferredThreadId);
      return;
    }

    if (!currentThreadId && data.length > 0) {
      setCurrentThreadId(data[0].id);
    }
  };

  const loadMessages = async (threadId: string) => {
    setLoadingMessages(true);
    try {
      const data = await getThreadMessages(threadId);
      setMessages(data);
      setError('');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load messages';
      if (message.includes('401')) {
        navigate('/login');
        return;
      }
      setError(message);
    } finally {
      setLoadingMessages(false);
    }
  };

  const loadDocuments = async (threadId: string) => {
    try {
      const data = await listDocuments(threadId);
      setDocuments(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load documents';
      setError(message);
    }
  };

  useEffect(() => {
    const bootstrap = async () => {
      try {
        await loadThreads();
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to load threads';
        if (message.includes('401')) {
          navigate('/login');
          return;
        }
        setError(message);
      } finally {
        setLoadingThreads(false);
      }
    };

    bootstrap();
  }, []);

  useEffect(() => {
    if (!currentThreadId) {
      setMessages([]);
      setDocuments([]);
      return;
    }
    loadMessages(currentThreadId);
    loadDocuments(currentThreadId);
  }, [currentThreadId]);

  const onCreateThread = async () => {
    try {
      const thread = await createThread('New Chat');
      await loadThreads(thread.id);
      setMessages([]);
      setDocuments([]);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create thread');
    }
  };

  const onDocumentUploaded = (document: Document) => {
    setDocuments((prev) => [document, ...prev.filter((item) => item.id !== document.id)]);
    showToast(`✅ "${document.original_filename}" ready for chat`, 'success');
    if (currentThreadId) {
      void loadDocuments(currentThreadId);
    }
  };

  const onDocumentUploadError = (message: string) => {
    setError(message);
    showToast(`❌ ${message}`, 'error');
  };

  const ensureThreadForUpload = async () => {
    if (currentThreadId) {
      return currentThreadId;
    }

    const thread = await createThread('New Chat');
    await loadThreads(thread.id);
    setCurrentThreadId(thread.id);
    setMessages([]);
    return thread.id;
  };

  const updatePendingAttachment = (localId: string, updater: (item: PendingAttachment) => PendingAttachment) => {
    setPendingAttachments((prev) => prev.map((item) => (item.localId === localId ? updater(item) : item)));
  };

  const uploadPendingFile = async (localId: string, file: File, threadId: string) => {
    try {
      console.log('[frontend] uploadPendingFile start', { localId, filename: file.name, threadId });
      updatePendingAttachment(localId, (item) => ({ ...item, status: 'uploading', progress: 0, error: undefined }));
      setError('');
      const uploaded = await uploadAttachment(file, threadId, (progress) => {
        updatePendingAttachment(localId, (item) => ({ ...item, progress }));
      });
      console.log('[frontend] uploadPendingFile success', uploaded);
      console.log('[frontend] uploaded file path:', uploaded.file_path);
      updatePendingAttachment(localId, (item) => ({
        ...item,
        status: 'uploaded',
        progress: 100,
        uploadedAttachment: uploaded,
      }));
      showToast(`✅ "${file.name}" attached successfully`, 'success');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Upload failed';
      console.error('[frontend] uploadPendingFile error', { localId, message });
      console.error('[frontend] full error:', err);
      setError(`Upload failed: ${message}`);
      showToast(`❌ Failed to attach "${file.name}": ${message}`, 'error');
      updatePendingAttachment(localId, (item) => ({ ...item, status: 'error', error: message }));
    }
  };

  const onFilesSelected = async (files: File[]) => {
    // files is already a plain Array snapshot — safe to use after any await
    try {
      const threadId = await ensureThreadForUpload();
      const selectedFiles = files;
      const maxBytes = MAX_UPLOAD_MB * 1024 * 1024;
      console.log('[frontend] files selected', selectedFiles.map((file) => ({ name: file.name, size: file.size, type: file.type })));
      console.log('[frontend] will upload to thread:', threadId);

      for (const file of selectedFiles) {
        const localId = `${Date.now()}-${file.name}-${Math.random()}`;
        const previewUrl = file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined;
        const extension = file.name.includes('.') ? file.name.split('.').pop()!.toLowerCase() : '';

        if (!SUPPORTED_FILE_EXTENSIONS.has(extension)) {
          showToast(`❌ "${file.name}" — file type not supported`, 'error');
          setPendingAttachments((prev) => [
            ...prev,
            {
              localId,
              file,
              previewUrl,
              progress: 0,
              status: 'error',
              error: 'This file type is not allowed',
            },
          ]);
          continue;
        }

        if (file.size > maxBytes) {
          showToast(`❌ "${file.name}" — file exceeds ${MAX_UPLOAD_MB} MB limit`, 'error');
          setPendingAttachments((prev) => [
            ...prev,
            {
              localId,
              file,
              previewUrl,
              progress: 0,
              status: 'error',
              error: `Maximum allowed file size is ${MAX_UPLOAD_MB} MB`,
            },
          ]);
          continue;
        }

        showToast(`⏳ Uploading "${file.name}"...`, 'info');
        setPendingAttachments((prev) => [
          ...prev,
          { localId, file, previewUrl, progress: 0, status: 'uploading' },
        ]);

        void uploadPendingFile(localId, file, threadId);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to prepare file upload';
      console.error('[frontend] onFilesSelected error:', message);
      setError(`File selection failed: ${message}`);
    }
  };

  const onRetryAttachment = async (localId: string) => {
    const target = pendingAttachments.find((item) => item.localId === localId);
    if (!target) {
      return;
    }

    try {
      const threadId = await ensureThreadForUpload();
      void uploadPendingFile(localId, target.file, threadId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to retry upload');
    }
  };

  const onRemoveAttachment = (localId: string) => {
    setPendingAttachments((prev) => {
      const target = prev.find((item) => item.localId === localId);
      if (target?.previewUrl) {
        URL.revokeObjectURL(target.previewUrl);
      }
      return prev.filter((item) => item.localId !== localId);
    });
  };

  const onDeleteThread = async (threadId: string) => {
    if (!window.confirm('Delete this thread permanently?')) {
      return;
    }

    try {
      await deleteThread(threadId);
      const nextThreads = threads.filter((thread) => thread.id !== threadId);
      setThreads(nextThreads);

      if (currentThreadId === threadId) {
        setCurrentThreadId(nextThreads[0]?.id ?? null);
        setPendingAttachments([]);
      }
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete thread');
    }
  };

  const onStartEditThread = (threadId: string, currentTitle: string) => {
    setEditingThreadId(threadId);
    setEditingTitle(currentTitle);
  };

  const onCancelEditThread = () => {
    setEditingThreadId(null);
    setEditingTitle('');
  };

  const onSaveEditThread = async () => {
    if (!editingThreadId) {
      return;
    }

    const newTitle = editingTitle.trim();
    if (!newTitle) {
      setError('Thread title cannot be empty');
      return;
    }

    try {
      setSavingTitle(true);
      await updateThread(editingThreadId, newTitle);
      await loadThreads(editingThreadId);
      setEditingThreadId(null);
      setEditingTitle('');
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update thread title');
    } finally {
      setSavingTitle(false);
    }
  };

  const onSend = async () => {
    const message = inputValue.trim();
    if (hasUploadingAttachments) {
      showToast('⏳ Still uploading — please wait a moment', 'info');
      return;
    }

    if ((!message && uploadedAttachmentIds.length === 0) || sending || generatingImage) {
      return;
    }

    // Detect image generation intent (no attachments needed)
    if (message && isImagePrompt(message) && uploadedAttachmentIds.length === 0) {
      // Ensure a thread exists
      let threadId = currentThreadId;
      if (!threadId) {
        try {
          const thread = await createThread('New Chat');
          await loadThreads(thread.id);
          setCurrentThreadId(thread.id);
          threadId = thread.id;
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Failed to create thread');
          return;
        }
      }

      setGeneratingImage(true);
      setInputValue('');

      try {
        showToast('🖼️ Generating image...', 'info');
        await generateImage(message, threadId);
        await loadThreads(threadId);
        await loadMessages(threadId);
        await loadDocuments(threadId);
        showToast('✅ Image generated successfully!', 'success');
        setError('');
      } catch (err) {
        const messageText = err instanceof Error ? err.message : 'Image generation failed';
        if (messageText.includes('401')) {
          navigate('/login');
          return;
        }
        setError(messageText);
        showToast(`❌ ${messageText}`, 'error');
      } finally {
        setGeneratingImage(false);
      }
      return;
    }

    setSending(true);
    setInputValue('');
    console.log('[frontend] onSend attachment ids', uploadedAttachmentIds);

    try {
      const result = await sendMessage(message, currentThreadId ?? undefined, uploadedAttachmentIds);
      await loadThreads(result.thread_id);
      await loadMessages(result.thread_id);
      await loadDocuments(result.thread_id);

      // Remove only attachments that were actually sent with this message.
      setPendingAttachments((prev) => {
        const sentIdSet = new Set(uploadedAttachmentIds);
        const remaining: PendingAttachment[] = [];

        for (const item of prev) {
          const attachmentId = item.uploadedAttachment?.id;
          const wasSent = attachmentId ? sentIdSet.has(attachmentId) : false;
          if (wasSent) {
            if (item.previewUrl) {
              URL.revokeObjectURL(item.previewUrl);
            }
            continue;
          }
          remaining.push(item);
        }

        return remaining;
      });
      setError('');
    } catch (err) {
      const messageText = err instanceof Error ? err.message : 'Failed to send message';
      if (messageText.includes('401')) {
        navigate('/login');
        return;
      }
      setError(messageText);
    } finally {
      setSending(false);
    }
  };

  const onLogout = async () => {
    try {
      await logout();
    } catch {
      // Navigate to login even if backend cookie clear fails.
    } finally {
      navigate('/login');
    }
  };

  const hasAnyAttachments = pendingAttachments.some((item) => item.status === 'uploading' || item.status === 'uploaded');
  const canSend = (inputValue.trim().length > 0 || uploadedAttachmentIds.length > 0 || hasAnyAttachments) && !sending && !generatingImage;

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(150deg, #0e4a53 0%, #1d2a44 50%, #402b3a 100%)',
        padding: '18px',
        position: 'relative',
      }}
    >
      {toast && (
        <div
          style={{
            position: 'fixed',
            top: '24px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 9999,
            padding: '14px 24px',
            borderRadius: '12px',
            fontSize: '14px',
            fontWeight: 600,
            color: 'white',
            background: toast.type === 'success' ? '#2e7d32' : toast.type === 'error' ? '#c62828' : '#1565c0',
            boxShadow: '0 6px 24px rgba(0,0,0,0.35)',
            maxWidth: '460px',
            textAlign: 'center',
            pointerEvents: 'none',
            whiteSpace: 'nowrap',
          }}
        >
          {toast.message}
        </div>
      )}
      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          height: 'calc(100vh - 36px)',
          display: 'grid',
          gridTemplateColumns: sidebarCollapsed ? '74px 1fr' : '290px 1fr',
          gap: '14px',
          transition: 'grid-template-columns 0.2s ease',
        }}
      >
        <aside
          style={{
            background: 'rgba(15, 22, 40, 0.92)',
            borderRadius: '16px',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            color: 'white',
            padding: '14px',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            {!sidebarCollapsed && <strong style={{ fontSize: '15px' }}>Conversations</strong>}
            <button
              type="button"
              onClick={() => setSidebarCollapsed((v) => !v)}
              style={{
                background: 'rgba(255,255,255,0.1)',
                color: 'white',
                border: 'none',
                borderRadius: '10px',
                width: '34px',
                height: '34px',
                cursor: 'pointer',
              }}
            >
              {sidebarCollapsed ? '>' : '<'}
            </button>
          </div>

          <button
            type="button"
            onClick={onCreateThread}
            style={{
              width: '100%',
              borderRadius: '12px',
              border: 'none',
              color: '#0f1628',
              background: '#f6d365',
              padding: sidebarCollapsed ? '10px 0' : '11px 12px',
              fontWeight: 700,
              cursor: 'pointer',
              marginBottom: '12px',
            }}
          >
            {sidebarCollapsed ? '+' : '+ New Chat'}
          </button>

          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {loadingThreads ? (
              !sidebarCollapsed && <span style={{ color: '#aeb7cc', fontSize: '13px' }}>Loading threads...</span>
            ) : threads.length === 0 ? (
              !sidebarCollapsed && <span style={{ color: '#aeb7cc', fontSize: '13px' }}>No threads yet</span>
            ) : (
              threads.map((thread) => {
                const active = thread.id === currentThreadId;
                const isEditing = editingThreadId === thread.id;
                return (
                  <div
                    key={thread.id}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: sidebarCollapsed ? '1fr' : '1fr auto auto',
                      gap: '6px',
                      alignItems: 'center',
                    }}
                  >
                    {isEditing && !sidebarCollapsed ? (
                      <input
                        value={editingTitle}
                        onChange={(e) => setEditingTitle(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            onSaveEditThread();
                          }
                          if (e.key === 'Escape') {
                            e.preventDefault();
                            onCancelEditThread();
                          }
                        }}
                        autoFocus
                        style={{
                          width: '100%',
                          border: '1px solid rgba(255,255,255,0.35)',
                          borderRadius: '10px',
                          background: 'rgba(255,255,255,0.1)',
                          color: 'white',
                          padding: '9px 10px',
                          fontSize: '13px',
                          outline: 'none',
                        }}
                      />
                    ) : (
                      <button
                        type="button"
                        onClick={() => setCurrentThreadId(thread.id)}
                        title={thread.title}
                        style={{
                          width: '100%',
                          textAlign: 'left',
                          border: 'none',
                          borderRadius: '10px',
                          background: active ? 'rgba(246, 211, 101, 0.25)' : 'rgba(255,255,255,0.08)',
                          color: 'white',
                          padding: sidebarCollapsed ? '10px 0' : '10px',
                          cursor: 'pointer',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          fontSize: '13px',
                        }}
                      >
                        {sidebarCollapsed ? '#' : thread.title}
                      </button>
                    )}
                    {!sidebarCollapsed && (
                      <button
                        type="button"
                        onClick={() => {
                          if (isEditing) {
                            onSaveEditThread();
                          } else {
                            onStartEditThread(thread.id, thread.title);
                          }
                        }}
                        disabled={savingTitle}
                        style={{
                          border: 'none',
                          borderRadius: '8px',
                          background: 'rgba(99, 179, 237, 0.2)',
                          color: '#d5ebff',
                          width: '28px',
                          height: '28px',
                          cursor: savingTitle ? 'not-allowed' : 'pointer',
                        }}
                        title={isEditing ? 'Save title' : 'Edit title'}
                      >
                        {isEditing ? 'S' : 'E'}
                      </button>
                    )}
                    {!sidebarCollapsed && (
                      <button
                        type="button"
                        onClick={() => onDeleteThread(thread.id)}
                        style={{
                          border: 'none',
                          borderRadius: '8px',
                          background: 'rgba(255, 107, 107, 0.2)',
                          color: '#ffd1d1',
                          width: '28px',
                          height: '28px',
                          cursor: 'pointer',
                        }}
                        title="Delete thread"
                      >
                        x
                      </button>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {!sidebarCollapsed && (
            <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <DocumentUploader
                threadId={currentThreadId}
                disabled={sending || generatingImage || hasUploadingAttachments}
                onUploaded={onDocumentUploaded}
                onError={onDocumentUploadError}
              />
              <UploadedDocuments documents={documents} />
            </div>
          )}

          <button
            type="button"
            onClick={onLogout}
            style={{
              marginTop: '12px',
              width: '100%',
              border: '1px solid rgba(255,255,255,0.24)',
              borderRadius: '10px',
              background: 'transparent',
              color: 'white',
              padding: sidebarCollapsed ? '9px 0' : '9px 12px',
              cursor: 'pointer',
            }}
          >
            {sidebarCollapsed ? '->' : 'Logout'}
          </button>
        </aside>

        <section
          style={{
            borderRadius: '16px',
            background: 'rgba(255, 255, 255, 0.95)',
            border: '1px solid rgba(255,255,255,0.45)',
            display: 'grid',
            gridTemplateRows: 'auto 1fr auto',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              padding: '14px 18px',
              borderBottom: '1px solid #e8e8ef',
              textAlign: 'left',
            }}
          >
            <h2 style={{ margin: 0, fontSize: '18px', color: '#1d2742' }}>{selectedThreadTitle}</h2>
            <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#687086' }}>
              Thread-based chat powered by Gemini with memory and attachments
            </p>
          </div>

          <div style={{ padding: '18px', overflowY: 'auto', background: '#f6f8fc' }}>
            {loadingMessages ? (
              <p style={{ color: '#687086' }}>Loading messages...</p>
            ) : messages.length === 0 ? (
              <p style={{ color: '#687086' }}>Start a new conversation by sending your first message.</p>
            ) : (
              messages.map((item) => (
                <ChatMessage
                  key={item.id}
                  userMessage={item.message}
                  assistantResponse={item.response}
                  attachments={item.attachments}
                />
              ))
            )}

            {generatingImage && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  color: '#687086',
                  fontSize: '13px',
                }}
              >
                <span
                  style={{
                    display: 'inline-block',
                    width: '16px',
                    height: '16px',
                    border: '2px solid #c7d7f5',
                    borderTopColor: '#2f6ed3',
                    borderRadius: '50%',
                    animation: 'spin 0.8s linear infinite',
                  }}
                />
                Generating image...
              </div>
            )}

            {sending && !generatingImage && (
              <div style={{ color: '#687086', textAlign: 'left', fontSize: '13px' }}>Generating response...</div>
            )}

            <div ref={endRef} />
          </div>

          <div style={{ borderTop: '1px solid #e8e8ef', padding: '12px 14px', background: 'white' }}>
            {error && (
              <div
                style={{
                  marginBottom: '10px',
                  background: '#ffe9e9',
                  color: '#9f2d2d',
                  borderRadius: '10px',
                  padding: '8px 10px',
                  textAlign: 'left',
                  fontSize: '13px',
                }}
              >
                {error}
              </div>
            )}

            <AttachmentStatusBanner items={pendingAttachments} />
            <AttachmentPreview items={pendingAttachments} onRemove={onRemoveAttachment} onRetry={onRetryAttachment} />

            <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr auto', gap: '8px' }}>
              <AttachmentUploader disabled={sending} onFilesSelected={onFilesSelected} />
              <input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    onSend();
                  }
                }}
                placeholder="Type your message or upload attachments..."
                disabled={sending}
                style={{
                  border: '1px solid #d6dae5',
                  borderRadius: '10px',
                  padding: '11px 12px',
                  outline: 'none',
                }}
              />
              <button
                type="button"
                onClick={onSend}
                disabled={sending || generatingImage || !canSend}
                style={{
                  border: 'none',
                  borderRadius: '10px',
                  padding: '0 16px',
                  background: (sending || generatingImage) ? '#b8bfd2' : !canSend ? '#b8bfd2' : hasUploadingAttachments ? '#7986cb' : '#2749b3',
                  color: 'white',
                  cursor: (sending || generatingImage || !canSend) ? 'not-allowed' : 'pointer',
                  fontWeight: 600,
                  fontSize: '14px',
                }}
              >
                {generatingImage ? '🖼️' : sending ? '...' : hasUploadingAttachments ? '⏳' : 'Send'}
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
