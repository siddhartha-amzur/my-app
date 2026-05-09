import type { PendingAttachment } from './AttachmentPreview';

interface AttachmentStatusBannerProps {
  items: PendingAttachment[];
}

export default function AttachmentStatusBanner({ items }: AttachmentStatusBannerProps) {
  if (items.length === 0) {
    return null;
  }

  const uploading = items.filter((item) => item.status === 'uploading').length;
  const uploaded = items.filter((item) => item.status === 'uploaded').length;
  const errors = items.filter((item) => item.status === 'error').length;

  if (uploading === 0 && errors === 0 && uploaded > 0) {
    return (
      <div
        style={{
          background: '#e8f5e9',
          border: '1px solid #4caf50',
          borderRadius: '8px',
          padding: '12px',
          marginBottom: '12px',
          textAlign: 'left',
        }}
      >
        <div style={{ color: '#2e7d32', fontWeight: 600, fontSize: '14px' }}>
          ✅ {uploaded} file{uploaded !== 1 ? 's' : ''} attached successfully
        </div>
        <div style={{ color: '#558b2f', fontSize: '12px', marginTop: '4px' }}>
          {items
            .filter((item) => item.status === 'uploaded')
            .map((item) => item.file.name)
            .join(', ')}
        </div>
      </div>
    );
  }

  if (uploading > 0) {
    return (
      <div
        style={{
          background: '#e3f2fd',
          border: '1px solid #2196f3',
          borderRadius: '8px',
          padding: '12px',
          marginBottom: '12px',
          textAlign: 'left',
        }}
      >
        <div style={{ color: '#1565c0', fontWeight: 600, fontSize: '14px' }}>
          ⏳ Uploading {uploading} file{uploading !== 1 ? 's' : ''}...
        </div>
        <div style={{ color: '#0d47a1', fontSize: '12px', marginTop: '4px' }}>
          Please wait for upload to complete
        </div>
      </div>
    );
  }

  if (errors > 0) {
    return (
      <div
        style={{
          background: '#ffebee',
          border: '1px solid #f44336',
          borderRadius: '8px',
          padding: '12px',
          marginBottom: '12px',
          textAlign: 'left',
        }}
      >
        <div style={{ color: '#c62828', fontWeight: 600, fontSize: '14px' }}>
          ❌ {errors} file{errors !== 1 ? 's' : ''} failed to attach
        </div>
        <div style={{ color: '#b71c1c', fontSize: '12px', marginTop: '4px' }}>
          {items
            .filter((item) => item.status === 'error')
            .map((item) => `${item.file.name}: ${item.error || 'Unknown error'}`)
            .join(' | ')}
        </div>
      </div>
    );
  }

  return null;
}
