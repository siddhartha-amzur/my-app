import { useRef, useState } from 'react';
import { uploadDocument, type Document } from '../lib/api';

interface DocumentUploaderProps {
  threadId: string | null;
  disabled?: boolean;
  onUploaded: (document: Document) => void;
  onError: (message: string) => void;
}

export default function DocumentUploader({ threadId, disabled, onUploaded, onError }: DocumentUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const canUpload = Boolean(threadId) && !disabled && !uploading;

  const handleChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';

    if (!file || !threadId) {
      return;
    }

    if (!file.name.toLowerCase().endsWith('.pdf')) {
      onError('Only PDF files are allowed for document chat.');
      return;
    }

    try {
      setUploading(true);
      setProgress(0);
      const uploaded = await uploadDocument(file, threadId, (value) => setProgress(value));
      onUploaded(uploaded);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Document upload failed';
      onError(message);
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <input
        ref={inputRef}
        type="file"
        hidden
        accept=".pdf,application/pdf"
        onChange={handleChange}
      />
      <button
        type="button"
        disabled={!canUpload}
        onClick={() => inputRef.current?.click()}
        style={{
          border: '1px solid #cfd5e4',
          borderRadius: '10px',
          background: canUpload ? '#ffffff' : '#eef1f7',
          color: '#24314f',
          padding: '8px 10px',
          cursor: canUpload ? 'pointer' : 'not-allowed',
          fontSize: '13px',
          fontWeight: 700,
        }}
      >
        📄 Upload PDF
      </button>
      {uploading && (
        <div style={{ fontSize: '12px', color: '#1f4ab8' }}>
          ⏳ Uploading PDF... {progress}%
        </div>
      )}
      {!threadId && <div style={{ fontSize: '12px', color: '#667085' }}>Create/select a thread first to upload PDFs.</div>}
    </div>
  );
}
