import type { Attachment } from '../lib/api';

export interface PendingAttachment {
  localId: string;
  file: File;
  progress: number;
  status: 'uploading' | 'uploaded' | 'error';
  error?: string;
  uploadedAttachment?: Attachment;
  previewUrl?: string;
}

interface AttachmentPreviewProps {
  items: PendingAttachment[];
  onRemove: (localId: string) => void;
  onRetry: (localId: string) => void;
}

function fileIcon(mimeType: string, name: string): string {
  if (mimeType.startsWith('image/')) return '🖼️';
  if (mimeType.startsWith('video/')) return '🎬';
  if (mimeType === 'application/pdf') return '📄';
  const ext = name.split('.').pop()?.toLowerCase();
  if (['py', 'js', 'ts', 'html', 'css', 'json'].includes(ext ?? '')) return '💻';
  if (['csv', 'xlsx'].includes(ext ?? '')) return '📊';
  return '📎';
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export default function AttachmentPreview({ items, onRemove, onRetry }: AttachmentPreviewProps) {
  if (items.length === 0) return null;

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '10px' }}>
      {items.map((item) => {
        const isImage = item.file.type.startsWith('image/') && item.previewUrl;
        const isUploading = item.status === 'uploading';
        const isUploaded = item.status === 'uploaded';
        const isError = item.status === 'error';

        const borderColor = isUploaded ? '#4caf50' : isError ? '#f44336' : '#c5cae9';
        const bgColor = isUploaded ? '#f1fff3' : isError ? '#fff5f5' : '#f5f7ff';

        return (
          <div
            key={item.localId}
            style={{
              display: 'flex',
              flexDirection: 'column',
              width: '200px',
              border: `1.5px solid ${borderColor}`,
              borderRadius: '12px',
              background: bgColor,
              overflow: 'hidden',
              position: 'relative',
            }}
          >
            {/* Image thumbnail OR icon header */}
            {isImage ? (
              <img
                src={item.previewUrl}
                alt={item.file.name}
                style={{ width: '100%', height: '90px', objectFit: 'cover', display: 'block' }}
              />
            ) : (
              <div
                style={{
                  height: '60px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '28px',
                  background: isUploaded ? '#e8f5e9' : isError ? '#ffebee' : '#e8eaf6',
                }}
              >
                {fileIcon(item.file.type, item.file.name)}
              </div>
            )}

            {/* File name + size */}
            <div style={{ padding: '8px 10px 4px' }}>
              <div
                title={item.file.name}
                style={{
                  fontSize: '13px',
                  fontWeight: 700,
                  color: '#1d2742',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {item.file.name}
              </div>
              <div style={{ fontSize: '11px', color: '#687086', marginTop: '2px' }}>
                {formatSize(item.file.size)}
              </div>
            </div>

            {/* Progress bar (uploading) */}
            {isUploading && (
              <div style={{ padding: '0 10px 6px' }}>
                <div style={{ height: '4px', borderRadius: '4px', background: '#dde1f5', overflow: 'hidden' }}>
                  <div
                    style={{
                      height: '100%',
                      width: `${item.progress}%`,
                      background: '#2749b3',
                      borderRadius: '4px',
                      transition: 'width 0.2s ease',
                    }}
                  />
                </div>
                <div style={{ fontSize: '11px', color: '#2749b3', marginTop: '3px' }}>
                  Uploading {item.progress}%
                </div>
              </div>
            )}

            {/* Status row */}
            {!isUploading && (
              <div style={{ padding: '2px 10px 8px', fontSize: '12px', color: isError ? '#c62828' : '#2e7d32', fontWeight: 600 }}>
                {isUploaded && '✅ Attached'}
                {isError && `❌ ${item.error || 'Upload failed'}`}
              </div>
            )}

            {/* Action buttons */}
            <div style={{ display: 'flex', gap: '6px', padding: '0 10px 10px' }}>
              {isError && (
                <button
                  type="button"
                  onClick={() => onRetry(item.localId)}
                  style={{
                    flex: 1,
                    border: 'none',
                    borderRadius: '7px',
                    background: '#2749b3',
                    color: '#fff',
                    padding: '5px 0',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: 600,
                  }}
                >
                  Retry
                </button>
              )}
              <button
                type="button"
                onClick={() => onRemove(item.localId)}
                style={{
                  flex: 1,
                  border: '1px solid #d6dae5',
                  borderRadius: '7px',
                  background: '#fff',
                  color: '#42526b',
                  padding: '5px 0',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: 600,
                }}
              >
                Remove
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
